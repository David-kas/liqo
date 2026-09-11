import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NEW_ORIGIN = 'https://liqo24.vercel.app';
const PHONE = '+7 (925) 121-99-72';
const PHONE_TEL = '+79251219972';
const WA_PHONE = '79626289777';
const WA_LINK = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent('Здравствуйте! Заказ LIQO, адрес: ')}`;
const TEXT_EXT = /\.(html|xml|txt|json|webmanifest|js|mjs|css|md)$/i;
const SKIP = new Set(['.git', 'node_modules', '.github', 'LIQO-ZOMRO', '_import-images', 'public']);
const LEGACY_HOSTS = ['liqo.pro','liqo24.vercel.app','alkodostavka24.vercel.app','alkodastavka.vercel.app','dostavka-alkogolya-24.vercel.app','alkodostavka24.online','dostavka-alkogolya.pro'];
const LEGACY_PHONE_RE = /\+7\s*\(999\)\s*786[-–]?39[-–]?67|\+79997863967/g;
const OBSOLETE = new Set(['city-kazan.html','city-moskva.html','dostavka.html','landing-viski.html','landing-vodka.html','landing-pivo.html']);
function walk(dir, out = []) { for (const name of fs.readdirSync(dir)) { if (SKIP.has(name)) continue; const file = path.join(dir,name), stat = fs.statSync(file); if (stat.isDirectory()) walk(file,out); else if (TEXT_EXT.test(name) && stat.size <= 2500000) out.push(file); } return out; }
function normalizeDomains(text) { let out=text; for (const host of LEGACY_HOSTS) { if (host === 'liqo24.vercel.app') continue; out=out.replace(new RegExp(`https?:\\/\\/(?:www\\.)?${host.replaceAll('.', '\\.')}`,'gi'),NEW_ORIGIN); out=out.replace(new RegExp(`(?<![A-Za-z0-9.-])${host.replaceAll('.', '\\.')}(?![A-Za-z0-9.-])`,'gi'),NEW_ORIGIN.replace('https://','')); } return out; }
function normalizePhone(text) { return text.replace(LEGACY_PHONE_RE, m => m.includes('(') ? PHONE : PHONE_TEL); }
function normalizeWhatsApp(text) {
  return text
    .replace(/https:\/\/wa\.me\/[^\"'\s<]+/gi, WA_LINK)
    .replace(/https:\/\/api\.whatsapp\.com\/send\?[^\"'\s<]+/gi, WA_LINK);
}
function routeFromHtml(file) { const rel=path.relative(ROOT,file).replaceAll(path.sep,'/'); if (OBSOLETE.has(rel)) return null; if (rel==='index.html') return '/'; if (!rel.endsWith('.html') || rel==='404.html' || rel.startsWith('admin/')) return null; if (rel.endsWith('/index.html')) return '/'+rel.slice(0,-'index.html'.length); return '/'+rel; }
function generateSitemap() { const pages=walk(ROOT).filter(f=>/\.html$/i.test(f)).map(routeFromHtml).filter(Boolean).filter((r,i,a)=>a.indexOf(r)===i).sort(); const urls=pages.map(route=>`  <url>\n    <loc>${NEW_ORIGIN}${route}</loc>\n    <changefreq>${route==='/'||route==='/catalog.html'?'weekly':'monthly'}</changefreq>\n    <priority>${route==='/'?'1.0':route==='/catalog.html'?'0.9':'0.7'}</priority>\n  </url>`).join('\n'); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`; }
let changed=0; for (const file of walk(ROOT)) { const before=fs.readFileSync(file,'utf8'), after=normalizeWhatsApp(normalizePhone(normalizeDomains(before))); if(after!==before){fs.writeFileSync(file,after,'utf8');changed++;} }
fs.writeFileSync(path.join(ROOT,'sitemap.xml'),generateSitemap(),'utf8');
fs.writeFileSync(path.join(ROOT,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${NEW_ORIGIN}/sitemap.xml\nHost: ${NEW_ORIGIN}\n`,'utf8');
console.log(`LIQO preparation complete: ${changed} files normalized; WhatsApp links standardized; sitemap generated.`);
