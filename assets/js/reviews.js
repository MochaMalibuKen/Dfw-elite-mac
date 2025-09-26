(function(){
  const grid = document.getElementById('reviewsGrid');
  const avgStarsEl = document.getElementById('avgStars');

  function stars(n){ n=Math.max(1,Math.min(5, +n||5)); return `<span class="stars">${'★'.repeat(n)}${'☆'.repeat(5-n)}</span>`; }
  function card(r){
    const initials = (r.name||'EM').split(' ').map(s=>s[0]).join('').toUpperCase().slice(0,2);
    const date = r.date ? new Date(r.date).toLocaleDateString() : '';
    return `
      <article class="card review-card"><div class="pad">
        <div class="review-avatar">${initials}</div>
        <div class="review-body">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <strong>${r.name || 'Customer'}</strong>
            <small style="opacity:.7">${date}</small>
          </div>
          <div>${stars(r.rating)}</div>
          <p class="small" style="margin:.4rem 0 0">${r.comment || ''}</p>
        </div>
      </div></article>
    `;
  }

  async function load(){
    try{
      const res = await fetch('data/reviews.json', { cache:'no-store' });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const links = data.links || {};
      const list = Array.isArray(data.reviews) ? data.reviews : [];

      // newest first
      list.sort((a,b)=> (new Date(b.date||0)) - (new Date(a.date||0)));

      if (!list.length){ grid.innerHTML = `<p class="small">No reviews yet — be the first!</p>`; }
      else { grid.innerHTML = list.map(card).join(''); }

      // average
      const avg = list.length ? Math.round(list.reduce((s,r)=> s + (+r.rating||5), 0) / list.length) : 5;
      avgStarsEl.innerHTML = `<strong>${list.length}</strong> reviews • ${stars(avg)}`;

      // external links
      const g = document.getElementById('googleReviews'); if (g && links.google) g.href = links.google;
      const f = document.getElementById('fbReviews');     if (f && links.facebook) f.href = links.facebook;
    }catch(e){
      console.error('reviews load failed:', e);
      grid.innerHTML = `<p class="small" style="color:#b00020">Couldn’t load reviews.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    load();

    // (Optional) Submit to Apps Script later
    const form = document.getElementById('reviewForm');
    const btn  = document.getElementById('reviewBtn');
    const msg  = document.getElementById('reviewMsg');
    if (!form) return;

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.date = new Date().toISOString().slice(0,10);

      const endpoint = "https://script.google.com/macros/s/YOUR-REVIEWS-DEPLOY-ID/exec"; // TODO

      btn.disabled = true; btn.textContent = "Sending…"; msg.textContent = "";
      try{
        await fetch(endpoint, { method:'POST', mode:'no-cors',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        grid.insertAdjacentHTML('afterbegin', card(payload)); // optimistic add
        form.reset();
        btn.textContent = "Submitted ✓";
      }catch(err){
        console.error(err);
        btn.disabled = false; btn.textContent = "Submit";
        msg.textContent = "Couldn’t send. Please try again.";
      }
    });
  });
})();