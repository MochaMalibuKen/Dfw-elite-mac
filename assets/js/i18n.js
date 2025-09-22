// Simple i18n loader + translator
window.I18N = { current: 'en', strings: {} };

async function loadLang(lang='en'){
  try{
    const res = await fetch(`data/lang/${lang}.json`);
    const json = await res.json();
    I18N.current = lang;
    I18N.strings = json;
    translate();
    localStorage.setItem('lang', lang);
  }catch(e){
    console.error('i18n load failed', e);
  }
}
// inside your I18N.set(lang) implementation, AFTER loading the dict and updating the DOM:
window.I18N.current = lang;
window.I18N.dict = loadedDict;

// notify listeners (calculator, etc.)
window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
// Get a translated string
function t(key){ return I18N.strings[key] || key; }

// Apply translations to elements with data-i18n
function translate(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const txt = t(key);
    // for inputs with placeholders
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      el.setAttribute('placeholder', txt);
    } else {
      el.textContent = txt;
    }
  });
}

// Wire EN/ES buttons
document.addEventListener('DOMContentLoaded', ()=>{
  const saved = localStorage.getItem('lang') || 'en';
  loadLang(saved);
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-setlang]');
    if(!btn) return;
    loadLang(btn.dataset.setlang);
  });
});
