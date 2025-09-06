function navHTML(){
  return `
  <nav class="nav">
    <div class="container inner">
      <a class="brand" href="index.html">
        <img src="assets/img/logo.png" alt="DFW Elite MAC logo">
        <span class="brand-name">DFW ELITE MEALS</span>
      </a>
      <div class="menu">
        <a href="menu.html" data-i18n="nav_menu">Menu</a>
        <a href="calculator.html" data-i18n="nav_calc">Calculator</a>
        <a href="athletes.html" data-i18n="nav_athletes">Athletes</a>
        <a href="catering.html" data-i18n="nav_catering">Catering</a>
        <a href="reviews.html" data-i18n="nav_reviews">Reviews</a>
        <a href="contact.html" data-i18n="nav_contact">Contact</a>
        <button class="lang-toggle" data-setlang="en">EN</button>
        <button class="lang-toggle" data-setlang="es">ES</button>
        <a class="cta btn" href="menu.html" data-i18n="nav_order_now">Order Now</a>
      </div>
    </div>
  </nav>`;
}

function footerHTML(){
  const year = new Date().getFullYear();
  return `
  <footer class="footer">
    <div class="container">
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div>
          <img src="assets/img/logo.png" alt="DFW Elite MAC" style="height:34px">
          <p class="small">© ${year} DFW Elite Meals & Catering Co.</p>
        </div>
        <div class="small" style="text-align:right">
          <a href="reviews.html">Reviews</a> •
          <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a> •
          <a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function mountChrome(){
  // Insert nav at top and footer at bottom of body
  const nav = document.createElement('div');
  nav.innerHTML = navHTML();
  document.body.prepend(nav);

  const foot = document.createElement('div');
  foot.innerHTML = footerHTML();
  document.body.append(foot);
}

document.addEventListener('DOMContentLoaded', mountChrome);
