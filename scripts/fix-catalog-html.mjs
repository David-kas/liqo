/**
 * Восстановление catalog.html: битый JSON-LD поглощал всю разметку страницы.
 * Запуск: node scripts/fix-catalog-html.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CART_PANEL_HTML } from './cart-panel-html.mjs';
import { headerBlock, footerHtml, stickyHtml, BASE } from './liqo-templates.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = path.join(ROOT, 'catalog.html');

function extractBrandForSchema(name) {
  const q = name.match(/«([^»]+)»/);
  if (q) return q[1];
  const m = name.match(/^(Водка|Виски|Коньяк|Пиво|Вино|Чипсы)\s+(.+?)(?:\s+0[,.]?\d|$)/i);
  if (m) return m[2].split(/\s+/).slice(0, 2).join(' ');
  return name.split(/\s+/).slice(0, 2).join(' ');
}

function parsePrice(text) {
  return String(text || '').replace(/[^\d]/g, '') || '0';
}

function parseCatalogProducts(html) {
  const products = [];
  const cardRe =
    /<div class="product-card"[^>]*data-category="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="product-card"|<\/div>\s*<!-- SEO)/g;
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const block = m[2];
    const h3 = block.match(/<h3>([^<]+)<\/h3>/);
    const price = block.match(/class="product-price"[^>]*>([^<]+)</);
    const img = block.match(/src="([^"]+)"/);
    if (!h3 || !price) continue;
    const name = h3[1].trim();
    products.push({
      name,
      price: parsePrice(price[1]),
      image: img ? img[1] : '',
      brand: extractBrandForSchema(name),
    });
  }
  return products;
}

function buildCatalogJsonLd(products) {
  const itemList = products.slice(0, 50).map((p, i) => {
    const imgPath = p.image.replace(/^\//, '');
    const imgUrl = p.image.startsWith('http') ? p.image : `${BASE}/${imgPath}`;
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: `${p.name}. Доставка алкоголя по Москве 24/7.`,
        image: imgUrl,
        brand: { '@type': 'Brand', name: p.brand },
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'RUB',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          seller: { '@id': `${BASE}/#organization` },
          url: `${BASE}/catalog.html`,
          areaServed: { '@type': 'City', name: 'Москва' },
        },
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE}/#organization`,
        name: 'LIQO',
        url: BASE,
        logo: `${BASE}/favicon.svg`,
        telephone: '+79251219972',
        sameAs: ['https://t.me/alkotaxi_bot'],
      },
      {
        '@type': 'CollectionPage',
        name: 'Каталог алкоголя и закусок LIQO',
        url: `${BASE}/catalog.html`,
        isPartOf: { '@type': 'WebSite', name: 'LIQO', url: `${BASE}/` },
        inLanguage: 'ru-RU',
        description:
          'Каталог алкоголя с доставкой на дом по Москве: водка, виски, коньяк, пиво, закуски',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${BASE}/catalog.html` },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Каталог алкоголя LIQO',
        url: `${BASE}/catalog.html`,
        numberOfItems: products.length,
        itemListElement: itemList,
      },
    ],
  };
}

function extractHead(html) {
  const idx = html.indexOf('<script type="application/ld+json">');
  if (idx === -1) throw new Error('JSON-LD block not found');
  return html.slice(0, idx).trimEnd();
}

function extractMain(html) {
  const m = html.match(/<main>[\s\S]*?<\/main>/);
  if (!m) throw new Error('<main> block not found');
  return m[0];
}

function extractTail(html) {
  const idx = html.search(/<script>\s*function loadMetrika/);
  if (idx === -1) throw new Error('Metrika script not found');
  return html.slice(idx).replace(/<\/body>[\s\S]*$/i, '').trim();
}

const broken = fs.readFileSync(CATALOG, 'utf8');
const main = extractMain(broken);
const products = parseCatalogProducts(main);

if (products.length === 0) {
  throw new Error('No products parsed from catalog.html');
}

const head = extractHead(broken);
const tail = extractTail(broken);
const jsonLd = buildCatalogJsonLd(products);

const page = `${head}
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 4)}
    </script>
</head>
<body>
    <div class="age-strip" role="note">18+ Продажа и передача алкоголя только совершеннолетним. Чрезмерное употребление вредит здоровью.</div>
${headerBlock('cat')}
${CART_PANEL_HTML}

<a href="tel:+79251219972" class="mobile-tel-fab mobile-tel-fab--secondary" title="Позвонить" aria-label="Позвонить в LIQO"><span class="visually-hidden">Телефон</span>☎</a>
${main}

${footerHtml()}

    ${stickyHtml()}
    ${tail}
</body>
</html>
`;

fs.writeFileSync(CATALOG, page, 'utf8');
console.log(`fix-catalog-html: rebuilt catalog.html (${products.length} products, valid JSON-LD + body)`);
