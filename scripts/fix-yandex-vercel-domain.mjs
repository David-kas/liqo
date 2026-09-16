/**
 * Финальный нормализатор публичного домена для Яндекс.Вебмастера.
 * В проекте основной адрес: https://liqo24.vercel.app
 * Запускается ПОСЛЕ всех SEO/migration-скриптов.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FROM = /https?:\/\/(?:www\.)?liqo\.pro/gi;
const FROM_HOST = /(?<![a-z0-9.-])liqo\.pro(?![a-z0-9.-])/gi;
const TO = 'https://liqo24.vercel.app';

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

let changed = 0;
for (const fp of walk(ROOT)) {
  let text = fs.readFileSync(fp, 'utf8');
  const before = text;
  text = text.replace(FROM, TO).replace(FROM_HOST, 'liqo24.vercel.app');
  if (text !== before) {
    fs.writeFileSync(fp, text, 'utf8');
    changed++;
  }
}

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${TO}/sitemap.xml\nHost: liqo24.vercel.app\n`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

console.log(`fix-yandex-vercel-domain: updated ${changed} files; canonical host = liqo24.vercel.app`);
