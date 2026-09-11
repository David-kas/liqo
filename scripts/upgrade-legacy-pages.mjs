import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'https://liqo24.vercel.app';
const SOURCE = path.join(ROOT, 'kategoria', 'vino', 'index.html');

const LEGACY_MARKERS = [
  'dostavka-alkogolya.pro',
  'class="wrap header-row"',
  'АлкоДоставка24',
  '/assets/app.css',
  'https://liqo.pro/delivery/',
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['.git', 'node_modules', 'public', 'LIQO-ZOMRO', '_import-images'].includes(name)) continue;
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walk(fp, out);
    else if (/\.html$/i.test(name)) out.push(fp);
  }
  return out;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pageUrl(fp) {
  const rel = path.relative(ROOT, fp).replaceAll(path.sep, '/');
  return rel.endsWith('/index.html')
    ? `${BASE}/${rel.slice(0, -'index.html'.length)}`
    : `${BASE}/${rel}`;
}

function h1From(html, fallback) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return fallback;
  return m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || fallback;
}

function modernizeLegacy(fp, oldHtml, shell) {
  const mainMatch = oldHtml.match(/<main\b[\s\S]*?<\/main>/i);
  const main = mainMatch ? mainMatch[0] : `<main><section class="hero hero-liqo"><div class="container"><h1>Страница LIQO</h1></div></section></main>`;
  const fallback = path.basename(path.dirname(fp)) === 'delivery' ? 'Условия доставки алкоголя' : 'Доставка алкоголя Москва 24/7';
  const h1 = h1From(oldHtml, fallback);
  const url = pageUrl(fp);
  const description = `${h1}. LIQO — круглосуточная доставка алкоголя по Москве и Московской области. Заказ 24/7, телефон, WhatsApp и Telegram. 18+.`;

  let out = shell.replace(/<main\b[\s\S]*?<\/main>/i, main);

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(h1)} — LIQO</title>`);
  out = out.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${esc(description)}">`);
  out = out.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${url}">`);
  out = out.replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${url}">`);
  out = out.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${esc(h1)} — LIQO">`);
  out = out.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${esc(description)}">`);

  // Старые ссылки/брендинг не должны попасть в новый шаблон даже внутри сохранённого main.
  out = out
    .replace(/https?:\/\/(?:www\.)?dostavka-alkogolya\.pro/gi, BASE)
    .replace(/https?:\/\/(?:www\.)?alkodostavka24\.online/gi, BASE)
    .replace(/https?:\/\/(?:www\.)?alkodostavka24\.vercel\.app/gi, BASE)
    .replace(/https?:\/\/(?:www\.)?alkodastavka\.vercel\.app/gi, BASE)
    .replace(/https?:\/\/liqo\.pro/gi, BASE)
    .replace(/АлкоДоставка24/g, 'LIQO')
    .replace(/АЛКОдоставка/g, 'LIQO')
    .replace(/https:\/\/t\.me\/alkodostavka/gi, 'https://t.me/alkotaxi_bot');

  // Для legacy-страницы оставляем единый современный CSS/JS и не подключаем старый assets/app.css.
  out = out.replace(/<link[^>]+href="\/assets\/app\.css"[^>]*>\s*/gi, '');
  out = out.replace(/<script[^>]+src="\/assets\/app\.js"[^>]*><\/script>\s*/gi, '');

  return out;
}

if (!fs.existsSync(SOURCE)) throw new Error(`Modern LIQO source template not found: ${SOURCE}`);
const shell = fs.readFileSync(SOURCE, 'utf8');
let upgraded = 0;
let leftovers = [];

for (const fp of walk(ROOT)) {
  if (fp === SOURCE) continue;
  const html = fs.readFileSync(fp, 'utf8');
  if (!LEGACY_MARKERS.some((marker) => html.includes(marker))) continue;

  const next = modernizeLegacy(fp, html, shell);
  fs.writeFileSync(fp, next, 'utf8');
  upgraded++;
}

for (const fp of walk(ROOT)) {
  const html = fs.readFileSync(fp, 'utf8');
  if (LEGACY_MARKERS.some((marker) => html.includes(marker))) leftovers.push(path.relative(ROOT, fp));
}

if (leftovers.length) {
  throw new Error(`Legacy page/template detected after modernization:\n${leftovers.join('\n')}`);
}

console.log(`Modernized legacy LIQO pages: ${upgraded}`);
