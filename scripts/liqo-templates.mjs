/**
 * LIQO — единые шаблоны header / footer / sticky bar.
 */
export const BASE = 'https://liqo.pro';
export const CALL_TEL = '+79251219972';
export const CALL_DISPLAY = '+7 (925) 121-99-72';
export const WA_PHONE = '79626289777';
export const WA_PREFILL = encodeURIComponent('Здравствуйте! Заказ LIQO, адрес: ');

const KATEGORII = [
  { slug: 'vodka', name: 'Водка' },
  { slug: 'viski', name: 'Виски' },
  { slug: 'konyak', name: 'Коньяк и бренди' },
  { slug: 'vino', name: 'Вино' },
  { slug: 'igristoe', name: 'Игристое и шампанское' },
  { slug: 'pivo', name: 'Пиво и сидр' },
  { slug: 'zakuski', name: 'Закуски' },
];

function dropdownCategoriesLinks() {
  return (
    KATEGORII.map((k) => `<a href="/kategoria/${k.slug}/">${k.name}</a>`).join('\n') +
    '\n<a href="/catalog.html">Полный каталог</a>'
  );
}

function navQuickCats() {
  return KATEGORII.map((k) => `<a href="/kategoria/${k.slug}/">${k.name}</a>`).join('\n');
}

function mobileNavPremiumBlock() {
  const cats = navQuickCats();
  return `<div class="nav-mobile-premium">
      <p class="nav-mp-kicker">LIQO</p>
      <section class="nav-mp-section" aria-label="Каталог">
        <h3 class="nav-mp-heading">Каталог</h3>
        <a href="/catalog.html" class="nav-mp-row nav-mp-row--lead">Каталог</a>
        <a href="/kategoria/" class="nav-mp-row">Все категории</a>
        <div class="nav-mp-grid">${cats}</div>
      </section>
      <section class="nav-mp-section" aria-label="Доставка">
        <h3 class="nav-mp-heading">Доставка</h3>
        <a href="/rayony.html" class="nav-mp-row">По районам Москвы</a>
        <a href="/metro/" class="nav-mp-row">У станций метро</a>
        <a href="/dostavka-nochyu-moskva.html" class="nav-mp-row">Ночью 24/7</a>
        <a href="/dostavka-chertanovo.html" class="nav-mp-row">Чертаново</a>
        <a href="/dostavka-butovo.html" class="nav-mp-row">Бутово</a>
        <p class="nav-mp-micro">Популярные станции</p>
        <div class="nav-mp-chips">
          <a href="/metro/kievskaya/">Киевская</a>
          <a href="/metro/taganskaya/">Таганская</a>
          <a href="/metro/marino/">Марьино</a>
          <a href="/metro/vyhino/">Выхино</a>
          <a href="/metro/belorusskaya/">Белорусская</a>
          <a href="/metro/chertanovskaya/">Чертановская</a>
        </div>
      </section>
      <section class="nav-mp-section" aria-label="Повод">
        <h3 class="nav-mp-heading">Поводы</h3>
        <a href="/povod/srochno/" class="nav-mp-row">Срочная доставка</a>
        <a href="/povod/premium/" class="nav-mp-row">Премиум</a>
        <a href="/povod/deshevo/" class="nav-mp-row">Недорого</a>
        <a href="/podarochnye-nabory.html" class="nav-mp-row">Подарочные наборы</a>
      </section>
      <section class="nav-mp-section" aria-label="Помощь">
        <h3 class="nav-mp-heading">Помощь</h3>
        <a href="/faq.html" class="nav-mp-row">FAQ</a>
        <a href="/vopros/" class="nav-mp-row">Вопросы и ответы</a>
        <a href="/contacts.html" class="nav-mp-row">Контакты</a>
        <a href="/" class="nav-mp-row">Главная</a>
      </section>
      <section class="nav-mp-section nav-mp-section--cta" aria-label="Заказ">
        <a href="tel:${CALL_TEL}" class="nav-mp-btn nav-mp-btn--call">Позвонить</a>
        <a href="https://wa.me/${WA_PHONE}?text=${WA_PREFILL}" class="nav-mp-btn nav-mp-btn--wa" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://t.me/alkotaxi_bot" class="nav-mp-btn nav-mp-btn--tg" target="_blank" rel="noopener">Telegram</a>
        <button type="button" class="nav-mp-btn nav-mp-btn--form js-oneclick-open">Заказать в 1 клик</button>
      </section>
    </div>`;
}

export function cartHeaderHtml(opts = {}) {
  const id = opts.mobileTrigger ? '' : ' id="site-cart-btn"';
  const countId = opts.mobileTrigger ? '' : ' id="cart-count"';
  const cls = opts.mobileTrigger ? 'header-cart-btn mobile-cart-trigger' : 'header-cart-btn';
  return `<button type="button" class="${cls}"${id} aria-label="Корзина">
      <svg class="header-cart-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6h15l-1.5 9H7.5L6 6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 6 5 3H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="20" r="1.25" fill="currentColor"/><circle cx="18" cy="20" r="1.25" fill="currentColor"/></svg>
      <span class="header-cart-label cart-btn-label">Корзина</span>
      <span class="cart-count"${countId}>0</span>
    </button>`;
}

/** @param {string|null} activeNav */
export function headerBlock(activeNav) {
  const a = (key) => (activeNav === key ? ' active' : '');
  return `<div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>
<header class="header site-header" id="site-header">
  <div class="header-mobile-callbar" aria-label="Мобильная шапка LIQO">
    <a href="/" class="mobile-callbar-logo" aria-label="LIQO — на главную"><img src="/images/logo-liqo.png" alt="LIQO" width="200" height="59" decoding="async"></a>
    <div class="mobile-callbar-right">
      <a href="tel:${CALL_TEL}" class="mobile-callbar-call-btn" aria-label="Позвонить ${CALL_DISPLAY}">Позвонить</a>
      ${cartHeaderHtml({ mobileTrigger: true })}
      <button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Открыть меню" aria-expanded="false" aria-controls="site-nav"><span class="burger-line" aria-hidden="true"></span><span class="burger-line" aria-hidden="true"></span><span class="burger-line" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="container header-main-row">
    <a href="/" class="logo logo-img" aria-label="LIQO — на главную"><img src="/images/logo-liqo.png" alt="LIQO" width="200" height="59" decoding="async"></a>
    <div class="nav-backdrop" id="nav-backdrop" hidden aria-hidden="true"></div>
    <nav class="main-nav" id="site-nav" aria-label="Основное меню">
      <div class="nav-inner-scroll">
        <ul class="nav-list-main nav-desktop-only">
          <li><a href="/catalog.html" class="nav-link${a('cat')}">Каталог</a></li>
          <li class="has-dropdown">
            <a href="/kategoria/" class="nav-link nav-link-dropdown${a('kat')}">Категории</a>
            <div class="dropdown-mega">${dropdownCategoriesLinks()}</div>
          </li>
          <li><a href="/rayony.html" class="nav-link${a('rayony')}">Районы</a></li>
          <li><a href="/metro/" class="nav-link${a('metro')}">Метро</a></li>
          <li><a href="/dostavka-nochyu-moskva.html" class="nav-link${a('night')}">Доставка</a></li>
          <li><a href="/faq.html" class="nav-link${a('faq')}">FAQ</a></li>
          <li><a href="/contacts.html" class="nav-link${a('contacts')}">Контакты</a></li>
        </ul>
        ${mobileNavPremiumBlock()}
      </div>
    </nav>
    <div class="header-actions">
      <a href="tel:${CALL_TEL}" class="header-phone-link">${CALL_DISPLAY}</a>
      <div class="header-actions-cart">${cartHeaderHtml()}</div>
      <button type="button" class="btn btn-header-order js-oneclick-open">Заказать</button>
    </div>
  </div>
</header>`;
}

export function footerHtml() {
  return `<footer class="footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="/" class="footer-logo"><img src="/images/logo-liqo.png" alt="LIQO" width="88" height="26" loading="lazy" decoding="async"></a>
      <p class="footer-tagline">Premium night delivery — алкоголь и закуски по Москве и МО, 24/7.</p>
      <p class="footer-age">18+ · алкоголь только совершеннолетним</p>
    </div>
    <nav class="footer-nav" aria-label="Навигация в подвале">
      <div class="footer-col">
        <h3 class="footer-heading">Каталог</h3>
        <a href="/catalog.html">Каталог</a>
        <a href="/kategoria/vodka/">Водка</a>
        <a href="/kategoria/viski/">Виски</a>
        <a href="/kategoria/vino/">Вино</a>
        <a href="/kategoria/">Все категории</a>
      </div>
      <div class="footer-col">
        <h3 class="footer-heading">Доставка</h3>
        <a href="/dostavka-nochyu-moskva.html">Доставка 24/7</a>
        <a href="/rayony.html">Районы</a>
        <a href="/metro/">Метро</a>
        <a href="/povod/srochno/">Срочно</a>
      </div>
      <div class="footer-col">
        <h3 class="footer-heading">Сервис</h3>
        <a href="/faq.html">FAQ</a>
        <a href="/vopros/">Вопросы</a>
        <a href="/contacts.html">Контакты</a>
        <a href="/privacy.html">Политика конфиденциальности</a>
      </div>
      <div class="footer-col footer-col--contact">
        <h3 class="footer-heading">Связь</h3>
        <a href="tel:${CALL_TEL}" class="footer-phone">${CALL_DISPLAY}</a>
        <a href="https://wa.me/${WA_PHONE}?text=${WA_PREFILL}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://t.me/alkotaxi_bot" target="_blank" rel="noopener">Telegram</a>
      </div>
    </nav>
  </div>
  <div class="container footer-bottom">
    <p>© 2026 LIQO · <a href="https://liqo.pro/">liqo.pro</a></p>
  </div>
</footer>`;
}

export function stickyHtml() {
  return `<div class="sticky-cta-bar" role="navigation" aria-label="Быстрые действия">
    <a href="tel:${CALL_TEL}" class="sticky-cta-item sticky-cta-call">Позвонить</a>
    <a href="/catalog.html" class="sticky-cta-item sticky-cta-catalog">Каталог</a>
    <button type="button" class="sticky-cta-item sticky-cta-cart" id="sticky-cart-btn">Корзина</button>
  </div>`;
}
