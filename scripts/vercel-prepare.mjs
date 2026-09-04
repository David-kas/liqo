/** Vercel preparation for the static LIQO site. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NEW_ORIGIN = 'https://liqo24.vercel.app';
const PHONE = '+7 (925) 121-99-72';
const TEXT_EXT = /\.(html|xml|txt|json|webmanifest|js|mjs|css|md)$/i;
const SKIP = new Set(['.git', 'node_modules', '.github', 'LIQO-ZOMRO', '_import-images']);
const LEGACY_HOSTS = [
  'liqo.pro',
  'alkodostavka24.vercel.app',
  'alkodastavka.vercel.app',
  'dostavka-alkogolya-24.vercel.app',
  'alkodostavka24.online',
];

function hostRegex(host) {
  return new RegExp(`(?<![A-Za-z0-9.-])${host.replaceAll('.', '\\.')}(?![A-Za-z0-9.-])`, 'gi');
}

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
  for (const host of LEGACY_HOSTS) {
    out = out.replace(new RegExp(`https?:\\/\\/(?:www\\.)?${host.replaceAll('.', '\\.')}`, 'gi'), NEW_ORIGIN);
    out = out.replace(hostRegex(host), 'liqo24.vercel.app');
  }
  return out;
}

function repairHomepageSchema(html) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${NEW_ORIGIN}/#website`,
        url: `${NEW_ORIGIN}/`,
        name: 'LIQO',
        inLanguage: 'ru-RU',
        publisher: { '@id': `${NEW_ORIGIN}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${NEW_ORIGIN}/#organization`,
        name: 'LIQO',
        url: `${NEW_ORIGIN}/`,
        logo: `${NEW_ORIGIN}/favicon.svg`,
        telephone: '+79251219972',
        sameAs: ['https://t.me/alkotaxi_bot'],
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${NEW_ORIGIN}/#business`,
        name: 'LIQO',
        url: `${NEW_ORIGIN}/`,
        image: `${NEW_ORIGIN}/favicon.svg`,
        telephone: '+79251219972',
        priceRange: '₽₽',
        description: 'Круглосуточная доставка алкоголя и закусок на дом по Москве и Московской области',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Москва',
          addressRegion: 'Москва',
          addressCountry: 'RU',
        },
        areaServed: [
          { '@type': 'City', name: 'Москва' },
          { '@type': 'AdministrativeArea', name: 'Московская область' },
        ],
        openingHoursSpecification: [{
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        }],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Каталог алкоголя',
          url: `${NEW_ORIGIN}/catalog.html`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Как заказать доставку алкоголя на дом?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Напишите в WhatsApp или Telegram, либо оставьте заявку на странице Контакты. Мы принимаем заказы круглосуточно.',
            },
          },
          {
            '@type': 'Question',
            name: 'Работаете ли вы круглосуточно?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Да, приём заказов и доставка по согласованию доступны 24/7, включая ночные часы и выходные.',
            },
          },
          {
            '@type': 'Question',
            name: 'Доставляете ли алкоголь ночью?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Да, ночная доставка по Москве и области возможна. Точное время зависит от района и загрузки — уточняйте у оператора.',
            },
          },
          {
            '@type': 'Question',
            name: 'Какая минимальная сумма заказа?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Минимальная сумма заказа от 1000 ₽. Условия акций и бесплатной доставки уточняйте при оформлении.',
            },
          },
          {
            '@type': 'Question',
            name: 'Как быстро привезут заказ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Во многих заказах по Москве укладываемся в 20–40 минут после подтверждения; в часы пик, ночью или при плохой погоде срок может быть ближе к часу. Менеджер назовёт реалистичное окно.',
            },
          },
        ],
      },
    ],
  };

  const block = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  return html.replace(/<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, block);
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

function routeFromHtml(file) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  if (!rel.endsWith('.html')) return null;
  if (rel === '404.html' || rel.startsWith('admin/')) return null;
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

function generateSitemap() {
  const pages = walk(ROOT)
    .filter((file) => /\.html$/i.test(file))
    .map(routeFromHtml)
    .filter(Boolean)
    .filter((route, index, all) => all.indexOf(route) === index)
    .sort((a, b) => a.localeCompare(b));

  const urls = pages.map((route) => {
    const priority = route === '/' ? '1.0' : route === '/catalog.html' ? '0.9' : '0.7';
    const changefreq = route === '/' || route === '/catalog.html' ? 'weekly' : 'monthly';
    return `  <url>\n    <loc>${NEW_ORIGIN}${route}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
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

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), generateSitemap(), 'utf8');
fs.writeFileSync(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${NEW_ORIGIN}/sitemap.xml\nHost: ${NEW_ORIGIN}\n`,
  'utf8',
);

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
  const legacy = LEGACY_HOSTS.some((host) => hostRegex(host).test(text));
  if (legacy) throw new Error(`Old domain remains after normalization in ${path.relative(ROOT, file)}`);
}

console.log(`LIQO Vercel preparation complete: ${changed} files normalized; sitemap generated for ${generateSitemap().match(/<loc>/g)?.length || 0} pages; JSON-LD warnings: ${invalidJsonLd}.`);
