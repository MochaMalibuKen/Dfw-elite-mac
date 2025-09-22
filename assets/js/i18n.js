// Simple i18n loader + translator
window.I18N = { current: 'en', strings: {}, dict: {} };

function t(key){ return I18N.strings[key] || key; }

function translate(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const txt = t(key);
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      el.setAttribute('placeholder', txt);
    } else {
      el.textContent = txt;
    }
  });
}

async function loadLang(lang='en'){
  try{
    const res = await fetch(`data/lang/${lang}.json`);
    const json = await res.json();
    I18N.current = lang;
    I18N.strings = json;
    I18N.dict = json; // alias for macro.js
    translate();
    localStorage.setItem('lang', lang);
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
  }catch(e){
    console.error('i18n load failed', e);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const saved = localStorage.getItem('lang') || 'en';
  loadLang(saved);
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-setlang]');
    if(!btn) return;
    loadLang(btn.dataset.setlang);
  });
});
