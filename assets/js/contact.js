(function(){
  // Using formsubmit.co for email delivery
  const FORMSPREE_ENDPOINT = "https://formsubmit.co/ajax/dfweliteco@gmail.com";

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
      if (form._trap && form._trap.value) return; // honeypot

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.page = location.pathname;
      payload.kind = form.dataset.form || 'contact';
      payload.timestamp = new Date().toISOString();

      const initial = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…"; msg.textContent = "";

      try{
        const ok = await send(payload);
        if(ok){
          btn.textContent = "Sent ✓";
          form.reset();
          msg.textContent = "Thanks! We’ll reply soon.";
        }else{
          btn.textContent = initial; btn.disabled = false;
          msg.textContent = "Couldn’t send. Please email us directly.";
        }
      }catch(err){
        console.error(err);
        btn.textContent = initial; btn.disabled = false;
        msg.textContent = "Network error. Please try again.";
      }
    });
  });
})();