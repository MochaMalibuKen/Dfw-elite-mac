// ===== Config (easy knobs) =====
const AVG_MEAL_CAL = 450;    // average calories per meal
const SURPLUS = 400;         // gain muscle surplus (+kcal)
const DEFICIT = 500;         // fat loss deficit (-kcal)
const FAT_PCT_DEFAULT = 0.30; // choose a point within ACSM 20-35%

// Activity multipliers commonly used alongside ACSM guidance
const activityMap = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9
};

// ---- i18n helper ----
function t(key, fallback){
  const dict = (window.I18N && window.I18N.dict) || {};
  return (dict[key] !== undefined ? dict[key] : (fallback !== undefined ? fallback : key));
}

// ---- Helpers ----
function toKg(lb){ return lb/2.20462; }
function toCm(ft,inches){ return ft*30.48 + inches*2.54; }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function fmt(n){ return new Intl.NumberFormat().format(Math.round(n)); }
function round1(n){ return Math.round(n*10)/10; }
function getFulfillment(){
  const el = document.getElementById('calcFulfillment');
  return (el && (el.value === 'delivery' || el.value === 'pickup')) ? el.value : 'pickup';
}


function calcBMR(sex, kg, cm, age){
  // Mifflin-St Jeor
  return 10*kg + 6.25*cm - 5*age + (sex==='male' ? 5 : -161);
}
function calcBMI(lb, ft, inch){
  const hIn = ft*12 + inch;
  return (lb / (hIn*hIn)) * 703;
}
function bmiCategory(bmi){
  if (bmi < 18.5) return t("bmi_under","Underweight");
  if (bmi < 25)   return t("bmi_normal","Normal");
  if (bmi < 30)   return t("bmi_over","Overweight");
  return t("bmi_obese","Obese");
}
function recommendMeals(goalCals){
  return clamp(Math.round(goalCals / AVG_MEAL_CAL), 2, 5);
}

async function loadPacks(){
  try{
    const res = await fetch('data/menu.json');
    const data = await res.json();
    return data.packs || [];
  }catch(e){ return []; }
}

// ---- ACSM-style macro logic (ranges) ----
function macroTargetsACSM(goal, activity, kg, kcal){
  // Protein (g/kg) typical ACSM ranges:
  // - General fitness: ~1.0-1.2 g/kg
  // - Endurance: ~1.2-1.6 g/kg
  // - Strength/Power: ~1.6-2.0 g/kg
  // - Energy deficit/cutting: ~1.8-2.2 g/kg
  let pMin=1.0, pMax=1.2;
  if (goal==='endurance') { pMin=1.2; pMax=1.6; }
  if (goal==='gain')      { pMin=1.6; pMax=2.0; }
  if (goal==='lose')      { pMin=1.8; pMax=2.2; }
  const pGG = ((pMin+pMax)/2) * kg;

  // Carbs (g/kg) by training load:
  // light: 3-5, moderate: 5-7, very: 6-10, athlete: 8-12
  let cMin=3, cMax=5;
  if (activity==='light')      { cMin=3; cMax=5; }
  if (activity==='moderate')   { cMin=5; cMax=7; }
  if (activity==='very')       { cMin=6; cMax=10; }
  if (activity==='athlete')    { cMin=8; cMax=12; }
  const carbG = goal==='endurance' ? (cMax*kg) : (((cMin+cMax)/2)*kg);

  // Fat as 20-35% kcal
  const fatKcal = kcal * FAT_PCT_DEFAULT;
  const fatG = fatKcal / 9;

  // Fit within kcal by trimming carbs if needed
  const kcalFromP = pGG*4;
  const kcalFromC = carbG*4;
  const kcalFromF = fatG*9;
  const totalK = kcalFromP + kcalFromC + kcalFromF;

  if (totalK > kcal*1.05){
    const remaining = Math.max(0, kcal - (kcalFromP + kcalFromF));
    const cAdj = remaining / 4;
    return { protein_g: Math.round(pGG), carbs_g: Math.round(cAdj), fat_g: Math.round(fatG) };
  }
  return { protein_g: Math.round(pGG), carbs_g: Math.round(carbG), fat_g: Math.round(fatG) };
}

// ---- Render ----
let LAST_STATE = null; // store last computed values for live i18n swaps

function renderPlan(state){
  try{
    if (!state) return;
    const { bmi, bmiCat, tdee, targetKcal, macros, meals, goal } = state;
    const packs = state.packs || {};
    const primary   = packs.primary || null;
    const secondary = packs.secondary || null;

    // Fulfillment selection (defaults to pickup)
    const ffEl = document.getElementById('calcFulfillment');
    const fulfill = (ffEl && (ffEl.value === 'delivery' || ffEl.value === 'pickup')) ? ffEl.value : 'pickup';

    // Resolve links safely (support old qbo_payment_link for backwards-compat)
    const primaryHref   = (primary && (primary.qbo_links?.[fulfill] || primary.qbo_payment_link)) || '#';
    const secondaryHref = (secondary && (secondary.qbo_links?.[fulfill] || secondary.qbo_payment_link)) || '#';

    const tips = goalTips(goal);

    const html = `
      <div class="card"><div class="pad">
        <h3>${t("calc_result_title","Your Estimated Plan")}</h3>
        <p class="small" style="opacity:.8">${t("calc_result_note","Estimates based on ACSM-style guidance. Use for planning; adjust to how you feel and perform.")}</p>

        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:8px">
          <div class="card"><div class="pad">
            <strong>${t("label_bmi","BMI")}</strong><br>
            ${round1(bmi)} • ${bmiCat}
          </div></div>
          <div class="card"><div class="pad">
            <strong>${t("label_tdee","TDEE")}</strong><br>
            ~${fmt(tdee)} ${t("unit_kcal_day","kcal/day")}
          </div></div>
          <div class="card"><div class="pad">
            <strong>${t("label_goal_cals","Goal Calories")}</strong><br>
            ~${fmt(targetKcal)} ${t("unit_kcal_day","kcal/day")}
          </div></div>
        </div>

        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px">
          <div class="card"><div class="pad">
            <strong>${t("label_protein","Protein")}</strong><br>
            ${fmt(macros.protein_g)} ${t("unit_g_day","g/day")}
            <div class="small" style="opacity:.7">~${round1(macros.protein_g / state.kg)} ${t("unit_g_per_kg","g/kg")}</div>
          </div></div>
          <div class="card"><div class="pad">
            <strong>${t("label_carbs","Carbs")}</strong><br>
            ${fmt(macros.carbs_g)} ${t("unit_g_day","g/day")}
            <div class="small" style="opacity:.7">${t("label_acsm_band","ACSM band by activity")}</div>
          </div></div>
          <div class="card"><div class="pad">
            <strong>${t("label_fat","Fat")}</strong><br>
            ${fmt(macros.fat_g)} ${t("unit_g_day","g/day")}
            <div class="small" style="opacity:.7">~${Math.round(FAT_PCT_DEFAULT*100)}% ${t("unit_of_kcal","of kcal")}</div>
          </div></div>
        </div>

        <div class="card" style="margin-top:10px"><div class="pad">
          <strong>${t("label_meals_per_day","Meals per day")}</strong>: ${meals} (${t("label_avg","avg")} ~${AVG_MEAL_CAL} ${t("unit_kcal_meal","kcal/meal")})
          <p class="small" style="margin:.3rem 0;opacity:.8">${tips}</p>
          <div class="actions" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
            ${primary ? `<a class="btn" href="${primaryHref}" target="_blank" rel="noopener">${primary.name_en || 'Pack'}</a>` : ''}
            ${secondary ? `<a class="btn ghost" href="${secondaryHref}" target="_blank" rel="noopener">${secondary.name_en || 'Alt Pack'}</a>` : ''}
            <a class="btn dark" href="order.html">${t("cta_customize","Customize & Order")}</a>
          </div>
          <p class="small" style="margin-top:6px">
            ${fulfill === 'delivery' ? 'Selected: Delivery (+$15).' : 'Selected: Pickup at F45 (Free).'}
            ${t("footer_secure","Secure checkout via QuickBooks")}
          </p>
        </div></div>

        <p class="small" style="opacity:.7;margin-top:8px">
          ${t("acsm_quick_ref","ACSM-style quick reference: Protein ~1.0-2.2 g/kg depending on training/goal; Carbs 3-12 g/kg based on training load; Fat 20-35% of total calories.")}
        </p>
      </div></div>
    `;
    document.getElementById('calcOut').innerHTML = html;
  }catch(err){
    console.error('renderPlan failed:', err, state);
    document.getElementById('calcOut').innerHTML =
      `<div class="card"><div class="pad">
        <p class="small" style="color:#b00020">We couldn’t render the plan. Please check your menu.json or try again.</p>
      </div></div>`;
  }
}


function goalTips(goal){
  if (goal==='gain') return t("tip_gain","Prioritize protein and total calories; 3-4 balanced meals/day plus a snack can help hit targets.");
  if (goal==='lose') return t("tip_lose","Keep protein higher to preserve lean mass; steady deficit with 2-3 meals/day works for many.");
  if (goal==='endurance') return t("tip_endurance","Fuel training days with more carbs (upper end of your band); consider pre/post-workout carbs.");
  return t("tip_maintain","Balance meals across the day; anchor each with quality protein, veggies, and a smart carb.");
}

// ---- Main handler ----
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('calcForm');
  if (form) form.addEventListener('submit', onCalc);

  // live i18n: re-render last result if user switches language
  window.addEventListener('i18n:changed', ()=>{
    if (LAST_STATE) renderPlan(LAST_STATE);
  });
});

async function onCalc(e){
  e.preventDefault();
  const f = e.target;

  // Pull & validate
  const age = +f.age.value, ft = +f.height_ft.value, inch = +f.height_in.value, lb = +f.weight_lb.value;
  const sex = f.sex.value, activity = f.activity.value, goal = f.goal.value;

  if(!(age>=18 && age<=75))  return outError("Enter a valid age (18-75).");
  if(!(ft>=4 && ft<=7))      return outError("Enter a valid height.");
  if(!(lb>=80 && lb<=500))   return outError("Enter a valid weight (80-500 lb).");

  // Core calcs
  const kg = toKg(lb);
  const cm = toCm(ft, inch);
  const bmr = calcBMR(sex, kg, cm, age);
  const tdee = bmr * (activityMap[activity] || 1.2);

  let targetKcal = tdee;
  if (goal==='lose') targetKcal = Math.max(bmr+100, tdee - DEFICIT);
  if (goal==='gain') targetKcal = tdee + SURPLUS;

  const bmi = calcBMI(lb, ft, inch);
  const bmiCat = bmiCategory(bmi);
  const macros = macroTargetsACSM(goal, activity, kg, targetKcal);
  const meals = recommendMeals(targetKcal);

  // Pack CTAs
  const allPacks = await loadPacks();
  const primary   = allPacks.find(p => p.id.includes(`${meals}x7`)) || allPacks.find(p=>p.id.includes('3x7')) || allPacks[0];
  const secondary = allPacks.find(p => p.id.includes(`${Math.min(5, meals+1)}x7`)) || allPacks.find(p=>p.id.includes('4x7')) || allPacks[1] || allPacks[0];

  // Save state and render
  LAST_STATE = { bmi, bmiCat, tdee, targetKcal, macros, meals, goal, kg, packs: { primary, secondary } };
  renderPlan(LAST_STATE);
}

function outError(msg){
  document.getElementById('calcOut').innerHTML =
    `<div class="card"><div class="pad"><p class="small" style="color:#b00020">${msg}</p></div></div>`;
}