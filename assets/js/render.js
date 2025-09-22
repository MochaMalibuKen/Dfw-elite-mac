let MENU = null;

function currency(n){ return `$${Number(n).toFixed(2)}`; }

// ----- MENU RENDER -----
async function loadMenu(){
  const elAlways = document.getElementById('alwaysOn');
  const elWeekly = document.getElementById('weeklyMenu');
  const elPacks  = document.getElementById('packs');

  if(!elAlways && !elWeekly && !elPacks) return;

  try{
    const res = await fetch('data/menu.json');
    MENU = await res.json();
  }catch(e){
    console.error('menu.json failed to load', e);
    return;
  }

  if(elAlways && MENU.always_on){
    elAlways.innerHTML = MENU.always_on.map(prod => cardHTML(prod)).join('');
  }
  if(elWeekly && MENU.weekly){
    elWeekly.innerHTML = MENU.weekly.map(prod => cardHTML(prod)).join('');
  }
  if(elPacks && MENU.packs){
    elPacks.innerHTML = MENU.packs.map(pk => `
      <div class="card"><div class="pad">
        <h3>${pk.name_en}</h3>
        <div class="price">${currency(pk.price)}</div>
        <a class="btn" href="${pk.qbo_payment_link}" target="_blank" rel="noopener">${t('buy_now')}</a>
      </div></div>
    `).join('');
  }

  attachCardHandlers();
}

function cardHTML(prod){
  const name = prod.name_en;
  const sizes = (prod.sizes_oz||[]).map(o=>`<option value="${o}">${o} oz</option>`).join('');
  const sides = (prod.sides||[]).map(s=>{
    const up = s.upcharge && s.upcharge>0 ? ` (+$${s.upcharge})` : '';
    return `<option value="${s.id}">${s.name_en}${up}</option>`;
  }).join('');

  return `
  <article class="card rel">
    ${prod.sold_out?'<span class="soldout">Sold out</span>':''}
    <img src="${prod.image||'assets/img/placeholder.jpg'}" alt="${name}" loading="lazy" style="width:100%;height:180px;object-fit:cover">
    <div class="pad">
      <h3>${name}</h3>
      <label>Size</label>
      <select class="size">${sizes}</select>
      <label>Sides</label>
      <select class="sides" multiple>${sides}</select>
      <div style="margin-top:.75rem;display:flex;gap:.6rem;align-items:center">
        <a class="btn pay" target="_blank" rel="noopener">Pay Now</a>
      </div>
    </div>
  </article>`;
}

function attachCardHandlers(){
  document.querySelectorAll('.card').forEach(card=>{
    const sizeEl = card.querySelector('.size');
    const sidesEl = card.querySelector('.sides');
    const pay = card.querySelector('.pay');
    if(!sizeEl || !pay) return;

    const name = card.querySelector('h3')?.textContent?.trim();
    const all = ((MENU?.always_on)||[]).concat((MENU?.weekly)||[]);
    const prod = all.find(p => p.name_en === name);
    if(!prod) return;

    function update(){
      const oz = sizeEl.value;
      const link = prod.qbo_payment_links?.[oz] || prod.qbo_payment_link || '#';
      const sides = sidesEl ? Array.from(sidesEl.selectedOptions).map(o=>o.value) : [];
      const memo = `Sides:${sides.join('+')}; Size:${oz}oz`;
      const href = link + (link.includes('?')?'&':'?') + 'memo=' + encodeURIComponent(memo);
      pay.setAttribute('href', href);
    }
    sizeEl.addEventListener('change', update);
    sidesEl && sidesEl.addEventListener('change', update);
    update();
  });
}

// ----- ATHLETES RENDER -----
async function loadAthletes(){
  const grid = document.getElementById('athletes');
  if(!grid) return;

  let data;
  try{
    const res = await fetch('data/athletes.json');
    data = await res.json();
  }catch(e){
    console.error('athletes.json failed to load', e);
    return;
  }

  const list = Array.isArray(data) ? data : (data.athletes || []);

  grid.innerHTML = list.map(a => `
    <div class="card">
      <img src="${a.photo || 'assets/img/placeholder.jpg'}" alt="${a.name_en||'Coming Soon'}" style="width:100%;height:200px;object-fit:cover">
      <div class="pad">
        <h3>${a.name_en || 'Coming Soon'}</h3>
        <p class="small">${a.sport || 'Fitness Ambassador'}</p>
        <div style="margin-top:.5rem">
          ${a.ig && a.ig !== '#' ? `<a class="btn ghost" href="${a.ig}" target="_blank" rel="noopener">Instagram</a>` : `<span class="small">Coming Soon</span>`}
        </div>
      </div>
    </div>
  `).join('');
}

// Load whichever sections exist on the page
document.addEventListener('DOMContentLoaded', ()=>{
  loadMenu();
  loadAthletes();
});

