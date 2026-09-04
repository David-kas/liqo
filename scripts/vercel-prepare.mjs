/** Vercel preparation for the static LIQO site. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NEW_ORIGIN = 'https://liqo24.vercel.app';
const PHONE = '+7 (925) 121-99-72';
const TEXT_EXT = /\.(html|xml|txt|json|webmanifest|js|mjs|css|md)$/i;
const SKIP = new Set(['.git', 'node_modules', '.github', 'LIQO-ZOMRO', '_import-images']);
const OLD_DOMAINS = [
  /https?:\/\/(?:www\.)?liqo\.pro/gi,
  /https?:\/\/(?:www\.)?alkodostavka24\.vercel\.app/gi,
  /https?:\/\/(?:www\.)?alkodastavka\.vercel\.app/gi,
  /https?:\/\/(?:www\.)?dostavka-alkogolya-24\.vercel\.app/gi,
  /https?:\/\/(?:www\.)?alkodostavka24\.online/gi,
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, out);
    else if (TEXT_EXT.test(name) && stat.size <= 2_500_000) out.push(file);
  }
  return out;
}

function normalizeDomains(text) {
  let out = text;
  for (const re of OLD_DOMAINS) out = out.replace(re, NEW_ORIGIN);
  out = out.replace(/(?<!@)(?<![A-Za-z0-9.-])liqo\.pro\b/gi, 'liqo24.vercel.app');
  return out;
}

function repairHomepageSchema(html) {
  // The source homepage contains one missing closing brace between OfferCatalog
  // and the following Organization object. Repair that exact structural boundary.
  const marker = '"hasOfferCatalog": {';
  const start = html.indexOf(marker);
  if (start === -1) return html;
  const org = html.indexOf('"@type": "Organization"', start);
  if (org === -1) return html;
  const between = html.slice(start, org);
  if (/}\s*,\s*{\s*$/.test(between)) {
    const fixedBetween = between.replace(/}\s*,\s*{\s*$/, '}\n            },\n            {\n            ');
    return html.slice(0, start) + fixedBetween + html.slice(org);
  }
  return html;
}

function addPhoneSeo(html) {
  let out = html;
  out = out.replace(/<title>([\s\S]*?)<\/title>/i, (_, value) => {
    if (/\+7\s*\(925\).*121[-–]?99[-–]?72|\+79251219972/.test(value)) return `<title>${value}</title>`;
    return `<title>${value.trim()} | ${PHONE}</title>`;
  });
  out = out.replace(/(<meta\s+name=["']description["']\s+content=["'])([^"']*)(["'][^>]*>)/i, (_, a, value, c) => {
    if (/\+7\s*\(925\).*121[-–]?99[-–]?72|\+79251219972/.test(value)) return a + value + c;
    const suffix = ` · Телефон: ${PHONE}`;
    let d = value.trim().replace(/[.\s]+$/, '');
    if (d.length + suffix.length > 158) d = d.slice(0, 158 - suffix.length).replace(/\s+\S*$/, '');
    return a + d + suffix + c;
  });
  return out;
}

const selected = new Set([
  'index.html', 'catalog.html', 'contacts.html', 'faq.html',
  'dostavka-nochyu-moskva.html', 'dostavka-butovo.html',
  'dostavka-chertanovo.html', 'rayony.html', 'city-moskva.html',
]);

let changed = 0;
for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = normalizeDomains(before);
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') after = repairHomepageSchema(after);
  if (selected.has(rel) && /<html\b/i.test(after)) after = addPhoneSeo(after);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed++;
  }
}

// Write the actual production sitemap and robots with the new Vercel origin.
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8')
    .replace(/https?:\/\/(?:www\.)?liqo\.pro/gi, NEW_ORIGIN);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}
fs.writeFileSync(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${NEW_ORIGIN}/sitemap.xml\n`,
  'utf8',
);

// Validate JSON-LD, but do not make deployment unavailable because of legacy
// markup outside the repaired homepage block. Log every remaining issue.
let invalidJsonLd = 0;
for (const file of walk(ROOT).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<script type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    try { JSON.parse(match[1]); }
    catch {
      invalidJsonLd++;
      console.warn(`JSON-LD warning: ${path.relative(ROOT, file)}`);
    }
  }
}

for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/liqo\.pro|alkodostavka24\.vercel\.app|alkodastavka\.vercel\.app|dostavka-alkogolya-24\.vercel\.app|alkodostavka24\.online/i.test(text)) {
    throw new Error(`Old domain remains after normalization in ${path.relative(ROOT, file)}`);
  }
}

console.log(`LIQO Vercel preparation complete: ${changed} files normalized; sitemap and robots updated; JSON-LD warnings: ${invalidJsonLd}.`);
