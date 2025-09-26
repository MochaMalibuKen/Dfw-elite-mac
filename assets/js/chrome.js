function navHTML(){
  return `
  <nav class="nav">
    <div class="container inner">
      <a class="brand" href="index.html">
        <img src="assets/img/logo.png" class="logo" alt="DFW Elite MAC logo">
        <span class="brand-name">ELITE MEALS and CATERING</span>
      </a>
      <div class="menu">
        <a href="menu.html" data-i18n="nav_menu">Menu</a>
        <a href="calculator.html" data-i18n="nav_calc">Calculator</a>
        <a href="ambassadors.html" data-i18n="nav_ambassadors">Ambassadors</a>
        <a href="catering.html" data-i18n="nav_catering">Catering</a>
        <a href="reviews.html" data-i18n="nav_reviews">Reviews</a>
        <a href="contact.html" data-i18n="nav_contact">Contact</a>

        <!-- Language buttons -->
        <button class="lang-toggle" data-setlang="en" aria-label="Switch to English">EN</button>
        <button class="lang-toggle" data-setlang="es" aria-label="Cambiar a Español">ES</button>

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
          <img src="assets/img/logo.png" class="logo" alt="DFW Elite MAC" style="height:34px">
          <p class="small">© ${year} DFW Elite Meals & Catering Co.</p>
        </div>
        <div class="small" style="text-align:right">
          <a href="reviews.html">Reviews</a> •
          <a href="https://instagram.com/koamealprepsllc" target="_blank" rel="noopener">Instagram</a> •
          <a href="https://www.facebook.com/profile.php?id=100090718213321" target="_blank" rel="noopener">Facebook</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function mountChrome(){
  // Insert nav at top and footer at bottom of body exactly once
  if (!document.querySelector('.nav')) {
    const nav = document.createElement('div');
    nav.innerHTML = navHTML();
    document.body.prepend(nav);
  }
  if (!document.querySelector('.footer')) {
    const foot = document.createElement('div');
    foot.innerHTML = footerHTML();
    document.body.append(foot);
  }
}

document.addEventListener('DOMContentLoaded', mountChrome);
