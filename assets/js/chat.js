(function(){
  const ENDPOINT = "https://formspree.io/f/abcde123"; // Replace with your Formspree endpoint

  const $fab    = document.getElementById('chat-fab');
  const $panel  = document.getElementById('chat-panel');
  const $close  = document.getElementById('chat-close');
  const $form   = document.getElementById('chat-form');
  const $status = document.getElementById('chat-status');

  function open(){ $panel.classList.add('open'); $panel.setAttribute('aria-hidden','false'); }
  function close(){ $panel.classList.remove('open'); $panel.setAttribute('aria-hidden','true'); }

  $fab.addEventListener('click', open);
  $close.addEventListener('click', close);

  $form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    $status.textContent = "Sending…";

    const data = Object.fromEntries(new FormData($form).entries());
    data.page = location.href;

    try{
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Accept':'application/json','Content-Type':'application/json' },
        body: JSON.stringify(data)
      });
      if(res.ok){
        $status.textContent = "Thanks! We’ll reply soon.";
        $form.reset();
        setTimeout(close, 1200);
      } else {
        $status.textContent = "Couldn’t send. Please email us directly.";
      }
    }catch(err){
      console.error(err);
      $status.textContent = "Network error. Try again later.";
    }
  });

  // Close if clicking outside panel
  document.addEventListener('click', (e)=>{
    if(!$panel.classList.contains('open')) return;
    if($panel.contains(e.target) || $fab.contains(e.target)) return;
    close();
  });
})();
