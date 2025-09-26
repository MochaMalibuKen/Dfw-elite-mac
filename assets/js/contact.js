(function(){
  // Replace with your Formspree endpoint:
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/abcde123"; // TODO

  // Helper to send JSON to Formspree (or your own endpoint)
  async function send(payload){
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept':'application/json', 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('contactForm');
    if(!form) return;

    const btn = document.getElementById('contactBtn');
    const msg = document.getElementById('contactMsg');

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();

      // Honeypot
      if (form._trap && form._trap.value) return;

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.page = location.href;
      payload.kind = form.dataset.form || 'contact';
      payload.timestamp = new Date().toISOString();

      msg.textContent = "";
      btn.disabled = true;
      const initial = btn.textContent;
      btn.textContent = "Sending…";

      try{
        const ok = await send(payload);
        if(ok){
          btn.textContent = "Sent ✓";
          form.reset();
          msg.textContent = "Thanks! We’ll reply soon.";
        }else{
          btn.textContent = initial;
          btn.disabled = false;
          msg.textContent = "Couldn’t send. Please email us directly.";
        }
      }catch(err){
        console.error(err);
        btn.textContent = initial;
        btn.disabled = false;
        msg.textContent = "Network error. Please try again.";
      }
    });
  });
})();