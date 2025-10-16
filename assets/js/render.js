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

/// ----- AMBASSADORS RENDER -----
async function loadAmbassadors(){
  // Support both IDs (new: ambGrid with amb-* classes, old: athletes with card)
  const grid = document.getElementById('ambGrid') || document.getElementById('athletes');
  if(!grid) return;

  try{
    const res = await fetch('data/ambassadors.json', { cache: 'no-store' });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.ambassadors || []);

    const useAmb = grid.id === 'ambGrid'; // if true, use amb-* classes
    grid.innerHTML = list.map(a => {
      const isFeatured = a.featured ? 'featured' : '';
      const theme = a.theme ? `theme-${a.theme}` : '';
      if (useAmb){
        // amb-* layout (matches your CSS above)
        return `
          <article class="amb-card ${isFeatured} ${theme}">
            <div class="amb-photo">
              <img src="${a.photo || 'assets/img/placeholder.jpg'}" alt="${a.name || 'Ambassador'}">
            </div>
            <div class="amb-pad">
              <h3 class="amb-name">${a.name || 'Coming Soon'}</h3>
              <p class="amb-meta">${a.role || ''}</p>
              <p class="amb-bio">${a.bio || ''}</p>
              <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
                ${a.socials?.facebook ? `<a class="btn ghost" href="${a.socials.facebook}" target="_blank" rel="noopener">Facebook</a>` : ''}
                ${a.socials?.instagram ? `<a class="btn ghost" href="${a.socials.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
              </div>
            </div>
          </article>
        `;
      } else {
        // legacy .card layout
        return `
          <div class="card ${isFeatured} ${theme}">
            <img src="${a.photo || 'assets/img/placeholder.jpg'}" 
                 alt="${a.name || 'Ambassador'}" 
                 style="width:100%;height:220px;object-fit:cover;border-top-left-radius:14px;border-top-right-radius:14px;">
            <div class="pad">
              <h3>${a.name || 'Coming Soon'}</h3>
              <p class="small">${a.role || ''}</p>
              <p>${a.bio || ''}</p>
              <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
                ${a.socials?.facebook ? `<a class="btn ghost" href="${a.socials.facebook}" target="_blank" rel="noopener">Facebook</a>` : ''}
                ${a.socials?.instagram ? `<a class="btn ghost" href="${a.socials.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
  } catch(e){
    console.error('ambassadors.json failed to load', e);
  }
}


// Load whichever sections exist on the page
document.addEventListener('DOMContentLoaded', ()=>{
  loadMenu();
  loadAmbassadors();
});

