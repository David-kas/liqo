import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Старые /vino.html, /viski.html и остальные корневые категории были отдельным
// устаревшим шаблоном. Источник нового дизайна — актуальные страницы
// /kategoria/<slug>/ из того же проекта.
const CATEGORIES = [
  'vermut',
  'vino',
  'viski',
  'vodka',
  'dzhin',
  'konyak',
  'liker',
  'pivo',
  'rom',
  'sigarety',
  'tekila',
  'shampanskoe',
];

let synced = 0;

for (const slug of CATEGORIES) {
  const source = path.join(ROOT, 'kategoria', slug, 'index.html');
  const target = path.join(ROOT, `${slug}.html`);

  if (!fs.existsSync(source)) continue;

  let html = fs.readFileSync(source, 'utf8');
  const categoryUrl = `/kategoria/${slug}/`;
  const rootUrl = `/${slug}.html`;

  // Корневая страница получает тот же современный шаблон, но canonical/OG/JSON-LD
  // должны указывать именно на /<slug>.html.
  html = html.replaceAll(categoryUrl, rootUrl);
  html = html.replaceAll(`"url":"https://liqo.pro${rootUrl}"`, `"url":"https://liqo24.vercel.app${rootUrl}"`);
  html = html.replaceAll(`"url": "https://liqo.pro${rootUrl}"`, `"url": "https://liqo24.vercel.app${rootUrl}"`);

  fs.writeFileSync(target, html, 'utf8');
  synced++;
}

console.log(`Modern LIQO category pages synced: ${synced}`);
