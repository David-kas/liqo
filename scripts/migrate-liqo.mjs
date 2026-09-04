/**
 * LIQO migration: брендинг, домен liqo.pro, header/footer, SEO fixes.
 * Запуск: node scripts/migrate-liqo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CART_PANEL_HTML } from './cart-panel-html.mjs';
import { headerBlock, footerHtml, stickyHtml, BASE } from './liqo-templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const OLD_DOMAINS = [
  /https?:\/\/alkodostavka24\.vercel\.app/gi,
  /https?:\/\/www\.alkodostavka24\.vercel\.app/gi,
  /https?:\/\/alkodastavka\.vercel\.app/gi,
  /https?:\/\/www\.alkodastavka\.vercel\.app/gi,
  /https?:\/\/dostavka-alkogolya-24\.vercel\.app/gi,
  /https?:\/\/alkodostavka24\.online/gi,
  /https?:\/\/www\.alkodostavka24\.online/gi,
  /alkodostavka24\.vercel\.app/gi,
  /alkodastavka\.vercel\.app/gi,
  /alkodostavka24\.online/gi,
];

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      if (['node_modules', '.git', 'LIQO-ZOMRO', '_import-images'].includes(name)) continue;
      walk(fp, acc);
    } else if (/\.(html|xml|txt|json|webmanifest|js|mjs)$/i.test(name)) {
      acc.push(fp);
    }
  }
  return acc;
}

function detectActiveNav(rel) {
  const r = rel.replace(/\\/g, '/').toLowerCase();
  if (r === 'catalog.html') return 'cat';
  if (r === 'rayony.html' || r.startsWith('dostavka-')) return 'rayony';
  if (r.startsWith('metro/')) return 'metro';
  if (r.startsWith('kategoria/')) return 'kat';
  if (r === 'dostavka-nochyu-moskva.html') return 'night';
  if (r === 'faq.html') return 'faq';
  if (r === 'contacts.html') return 'contacts';
  if (r.startsWith('raion/')) return 'rayony';
  return null;
}

function fixDomains(c) {
  let out = c;
  for (const re of OLD_DOMAINS) {
    out = out.replace(re, BASE);
  }
  return out;
}

function fixBrandInMeta(c) {
  let out = c;
  out = out.replace(/<meta name="author" content="[^"]*">/g, '<meta name="author" content="LIQO">');
  out = out.replace(/content="АЛКОдоставка"/g, 'content="LIQO"');
  out = out.replace(/"name": "АЛКОдоставка"/g, '"name": "LIQO"');
  out = out.replace(/info@alkovoz\.online/g, 'info@liqo.pro');
  out = out.replace(/mailto:info@alkovoz\.online/g, 'mailto:info@liqo.pro');
  out = out.replace(
    /Заказ%20%D0%90%D0%9B%D0%9A%D0%9E%D0%B4%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B0/g,
    encodeURIComponent('Заказ LIQO'),
  );
  out = out.replace(/Заказ АЛКОдоставка/g, 'Заказ LIQO');
  out = out.replace(/Сайт АЛКОдоставка/g, 'Сайт LIQO');
  out = out.replace(/зону доставки АЛКОдоставка/g, 'зону доставки LIQO');
  out = out.replace(/АЛКОдоставка/g, 'LIQO');
  out = out.replace(/AlkoDostavka24/g, 'LIQO');
  out = out.replace(/alkovoz\.online/g, 'liqo.pro');
  return out;
}

function fixTitleSuffix(c) {
  let out = c;
  out = out.replace(
    /<title>Доставка алкоголя в Москве на дом 24\/7 — заказать с доставкой \| АЛКОдоставка 18\+<\/title>/,
    '<title>Доставка алкоголя в Москве 24/7 на дом — LIQO</title>',
  );
  out = out.replace(
    /<meta name="description" content="Заказать алкоголь с доставкой на дом в Москве и МО\.[^"]*">/,
    '<meta name="description" content="LIQO — доставка алкоголя и закусок на дом в Москве и МО 24/7. Водка, виски, вино, пиво. Часто 20–60 мин. Заказ от 1000 ₽. 18+.">',
  );
  out = out.replace(/\| АЛКОдоставка 18\+/g, '— LIQO');
  out = out.replace(/\| АЛКОдоставка/g, '— LIQO');
  out = out.replace(/ — АЛКОдоставка/g, ' — LIQO');
  out = out.replace(
    /<meta property="og:image" content="[^"]*">/,
    '<meta property="og:image" content="https://liqo.pro/images/og-liqo.svg">',
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*АЛКОдоставка[^"]*">/,
    '<meta property="og:title" content="Доставка алкоголя в Москве 24/7 — LIQO">',
  );
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*АЛКОдоставка[^"]*">/,
    '<meta name="twitter:title" content="LIQO — доставка алкоголя 24/7 по Москве">',
  );
  return out;
}

function fixFaviconLinks(c) {
  const faviconBlock = `<link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
    <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
  let out = c.replace(/<link rel="icon"[^>]*>\s*/g, '');
  out = out.replace(/<link rel="apple-touch-icon"[^>]*>\s*/g, '');
  if (out.includes('name="viewport"')) {
    out = out.replace(/(<meta name="viewport"[^>]*>)/, `$1\n    ${faviconBlock}`);
  }
  return out;
}

function removeFakeRatings(c) {
  return c.replace(/"aggregateRating"\s*:\s*\{[^}]*\}[^,]*,?\s*/gs, '');
}

function replaceHeader(html, activeNav) {
  const start = html.indexOf('<div class="scroll-progress"');
  if (start === -1) return html;
  const headerEnd = html.indexOf('</header>', start);
  if (headerEnd === -1) return html;
  const end = headerEnd + '</header>'.length;
  return html.slice(0, start) + headerBlock(activeNav) + html.slice(end);
}

function replaceFooter(html) {
  const start = html.indexOf('<footer class="footer"');
  if (start === -1) return html;
  const end = html.indexOf('</footer>', start);
  if (end === -1) return html;
  return html.slice(0, start) + footerHtml() + html.slice(end + '</footer>'.length);
}

function replaceSticky(html) {
  const re = /<div class="sticky-cta-bar"[\s\S]*?<\/div>\s*(?=<script|<\/body)/;
  if (!re.test(html)) {
    const bodyEnd = html.lastIndexOf('</body>');
    if (bodyEnd === -1) return html;
    return html.slice(0, bodyEnd) + stickyHtml() + '\n    ' + html.slice(bodyEnd);
  }
  return html.replace(re, stickyHtml() + '\n    ');
}

function fixIndexHero(html) {
  if (!html.includes('class="hero"')) return html;
  const heroRe = /<section class="hero[^"]*">[\s\S]*?<\/section>/;
  const newHero = `<section class="hero hero-liqo">
            <div class="container hero-liqo-grid">
                <div class="hero-liqo-copy">
                    <p class="hero-brand">LIQO</p>
                    <h1>Доставка алкоголя в Москве на дом 24/7</h1>
                    <p class="hero-subtitle">Крепкие напитки, вино, пиво и закуски. Доставка по Москве и Московской области.</p>
                    <p class="hero-trust-pills"><span>20–60 мин</span><span>24/7</span><span>Москва и МО</span><span>18+</span></p>
                    <div class="hero-buttons">
                        <a href="/catalog.html" class="btn btn-large">Смотреть каталог</a>
                        <button type="button" class="btn btn-large btn-outline js-oneclick-open">Заказать в 1 клик</button>
                    </div>
                </div>
                <div class="hero-liqo-visual" aria-hidden="true">
                    <picture>
                        <source media="(max-width: 768px)" srcset="/images/hero-whiskey-bg-mobile.webp" type="image/webp">
                        <img src="/images/hero-whiskey-bg.webp" alt="" width="520" height="400" loading="eager" decoding="async" fetchpriority="high">
                    </picture>
                </div>
            </div>
        </section>`;
  return html.replace(heroRe, newHero);
}

function fixSeoBlockHeading(html) {
  return html
    .replace(
      /<h2>АЛКОдоставка — ваш надёжный партнёр/g,
      '<h2 id="seo-info-heading">Полезная информация о доставке</h2>\n                <h3>LIQO — ваш надёжный партнёр',
    )
    .replace(/Компания АЛКОдоставка/g, 'Сервис LIQO')
    .replace(/в зону доставки АЛКОдоставка/g, 'в зону доставки LIQO');
}

function ensureCartPanel(html) {
  if (html.includes('id="cart-panel"')) return html;
  const insertAfter = html.indexOf('</header>');
  if (insertAfter === -1) return html;
  const pos = insertAfter + '</header>'.length;
  return html.slice(0, pos) + '\n' + CART_PANEL_HTML + html.slice(pos);
}

let changed = 0;
const htmlFiles = walk(ROOT).filter((f) => f.endsWith('.html'));

for (const fp of htmlFiles) {
  const rel = path.relative(ROOT, fp);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  const active = detectActiveNav(rel);

  html = fixDomains(html);
  html = fixBrandInMeta(html);
  html = fixTitleSuffix(html);
  html = fixFaviconLinks(html);
  html = removeFakeRatings(html);
  html = replaceHeader(html, active);
  html = ensureCartPanel(html);
  html = replaceFooter(html);
  html = replaceSticky(html);

  if (rel === 'index.html') {
    html = fixIndexHero(html);
    html = fixSeoBlockHeading(html);
  }

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed++;
  }
}

const robots = `User-agent: *
Allow: /

Sitemap: https://liqo.pro/sitemap.xml
Host: https://liqo.pro
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sm = fs.readFileSync(sitemapPath, 'utf8');
  sm = fixDomains(sm);
  fs.writeFileSync(sitemapPath, sm, 'utf8');
}

const manifestPath = path.join(ROOT, 'site.webmanifest');
if (fs.existsSync(manifestPath)) {
  let m = fs.readFileSync(manifestPath, 'utf8');
  m = m
    .replace(/"name": "АЛКОдоставка"/, '"name": "LIQO"')
    .replace(/"short_name": "АЛКОдоставка"/, '"short_name": "LIQO"')
    .replace(/#d32f2f/, '#0a0a0a')
    .replace(/"background_color": "#ffffff"/, '"background_color": "#0a0a0a"')
    .replace(/favicon-192x192/, 'web-app-manifest-192x192')
    .replace(/favicon-512x512/, 'web-app-manifest-512x512');
  fs.writeFileSync(manifestPath, m, 'utf8');
}

const llmsPath = path.join(ROOT, 'llms.txt');
if (fs.existsSync(llmsPath)) {
  let t = fs.readFileSync(llmsPath, 'utf8');
  t = fixDomains(fixBrandInMeta(t));
  fs.writeFileSync(llmsPath, t, 'utf8');
}

const sendPath = path.join(ROOT, 'telegram', 'send.js');
if (fs.existsSync(sendPath)) {
  let s = fs.readFileSync(sendPath, 'utf8');
  s = s.replace(/АЛКОдоставка/g, 'LIQO');
  fs.writeFileSync(sendPath, s, 'utf8');
}

console.log(`migrate-liqo: updated ${changed} HTML files`);
