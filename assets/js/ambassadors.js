(function(){
  const grid = document.getElementById('ambGrid');
  if (!grid) return;

  // simple skeletons while loading
  grid.innerHTML = `
    <div class="amb-card"><div class="amb-photo amb-skeleton"></div><div class="amb-pad"><div class="amb-skeleton" style="height:16px;width:60%"></div></div></div>
    <div class="amb-card"><div class="amb-photo amb-skeleton"></div><div class="amb-pad"><div class="amb-skeleton" style="height:16px;width:60%"></div></div></div>
    <div class="amb-card"><div class="amb-photo amb-skeleton"></div><div class="amb-pad"><div class="amb-skeleton" style="height:16px;width:60%"></div></div></div>
  `;

  function icon(label){
    if (label==='instagram') return '📸';
    if (label==='facebook')  return '📘';
    if (label==='tiktok')    return '🎵';
    if (label==='x' || label==='twitter') return '𝕏';
    return '🔗';
  }

  function card(a){
    const socials = a.socials || {};
    const links = Object.entries(socials)
      .filter(([,url]) => !!url)
      .map(([k,url]) => `<a href="${url}" target="_blank" rel="noopener">${icon(k)} ${k}</a>`)
      .join('');

    const isPlaceholder = !!a.placeholder;

    return `
      <article class="amb-card ${isPlaceholder ? 'placeholder' : ''}">
        <div class="amb-photo">
          ${isPlaceholder
            ? `<span>📸</span>`
            : `<img src="${a.photo}" alt="${a.name}" loading="lazy" onerror="this.src='assets/img/amb-placeholder.jpg'">`}
        </div>
        <div class="amb-pad">
          ${isPlaceholder ? `<div class="amb-badge">Coming Soon</div>` : ``}
          <h3 class="amb-name">${a.name || 'Ambassador'}</h3>
          ${a.role ? `<p class="amb-meta">${a.role}</p>` : ``}
          ${a.bio ? `<p class="amb-bio">${a.bio}</p>` : ``}
        </div>
        ${!isPlaceholder && links ? `<div class="amb-social">${links}</div>` : ``}
      </article>
    `;
  }

  async function load(){
    try{
      const res = await fetch('data/ambassadors.json', { cache: 'no-store' });
      if(!res.ok) throw new Error(`HTTP ${res.status} loading ambassadors.json`);
      const data = await res.json();
      const list = Array.isArray(data.ambassadors) ? data.ambassadors : [];
      if(!list.length){
        grid.innerHTML = `<p class="small">Profiles coming soon.</p>`;
        return;
      }
      grid.innerHTML = list.map(card).join('');
    }catch(e){
      console.error('Ambassadors load failed:', e);
      grid.innerHTML = `<div class="card"><div class="pad">
        <p class="small" style="color:#b00020">Couldn’t load ambassadors. Check Console/Network.</p>
      </div></div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();