import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(file)) {
  console.log('wordstat-spam-experiment: index.html not found');
  process.exit(0);
}

let html = fs.readFileSync(file, 'utf8');

const START = '<!-- WORDSTAT-SPAM-EXPERIMENT:START -->';
const END = '<!-- WORDSTAT-SPAM-EXPERIMENT:END -->';
const existing = new RegExp(`${START}[\\s\\S]*?${END}`, 'g');
html = html.replace(existing, '');

html = html
  .replace(/<title>[\\s\\S]*?<\\/title>/i, '<title>Доставка алкоголя Москва 24/7 — на дом круглосуточно | LIQO</title>')
  .replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="Доставка алкоголя в Москве и Московской области на дом 24/7. Круглосуточная и ночная доставка алкоголя: заказать или купить алкоголь с доставкой на дом. LIQO, 18+.">')
  .replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="Доставка алкоголя Москва 24/7 — на дом круглосуточно | LIQO">')
  .replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="Доставка алкоголя на дом в Москве и МО круглосуточно. Заказать алкоголь с доставкой 24/7, в том числе ночью. 18+.">')
  .replace(/<meta name="twitter:title" content="[^"]*">/i, '<meta name="twitter:title" content="Доставка алкоголя Москва 24/7 — LIQO">')
  .replace(/<meta name="twitter:description" content="[^"]*">/i, '<meta name="twitter:description" content="Круглосуточная доставка алкоголя на дом в Москве и Московской области, 24/7 и ночью. 18+.">')
  .replace(/<h1>[^<]*<\\/h1>/i, '<h1>Доставка алкоголя в Москве на дом круглосуточно 24/7</h1>')
  .replace(/<p class="hero-subtitle">[\\s\\S]*?<\\/p>/i, '<p class="hero-subtitle">Доставка алкоголя Москва 24/7: алкоголь на дом, ночью и круглосуточно по Москве и Московской области. Заказать алкоголь с доставкой можно через каталог или форму заказа.</p>')
  .replace(/<h2 id="trust-heading">[\\s\\S]*?<\\/h2>/i, '<h2 id="trust-heading">Круглосуточная доставка алкоголя Москва 24/7</h2>')
  .replace(/<section class="how-to-order"><div class="container"><h2>[\\s\\S]*?<\\/h2>/i, '<section class="how-to-order"><div class="container"><h2>Заказать алкоголь с доставкой на дом в Москве</h2>');

const block = `${START}
<section class="seo-block wordstat-spam-experiment" aria-labelledby="wordstat-spam-heading">
  <div class="container">
    <h2 id="wordstat-spam-heading">Доставка алкоголя в Москве на дом — круглосуточно 24/7</h2>
    <p><strong>Доставка алкоголя</strong> — основной запрос, по которому пользователи ищут сервис LIQO. На этой странице собрана <strong>доставка алкоголя Москва</strong>, <strong>доставка алкоголя на дом</strong>, <strong>доставка алкоголя 24</strong> и <strong>доставка алкоголя круглосуточно</strong>. Если нужна <strong>доставка алкоголя Москва 24</strong>, <strong>доставка алкоголя ночью</strong> или <strong>доставка алкоголя на дом в Москве</strong>, оформить заказ можно через каталог, форму или по телефону. LIQO работает с заявками 24/7, только 18+.</p>

    <h3>Заказать алкоголь с доставкой на дом</h3>
    <p>Пользователи ищут нас как <strong>заказать алкоголь с доставкой</strong>, <strong>купить алкоголь с доставкой</strong>, <strong>заказать алкоголь с доставкой на дом</strong>, <strong>купить алкоголь с доставкой на дом</strong> и <strong>заказать алкоголь с доставкой Москва</strong>. Для Москвы также актуальны запросы <strong>заказ алкоголя на дом Москва доставка</strong>, <strong>купить алкоголь в Москве с доставкой</strong>, <strong>заказать алкоголь с доставкой на дом Москва</strong> и <strong>доставка алкоголя на дом Москва недорого</strong>. На LIQO можно выбрать водку, виски, коньяк, вино, шампанское, пиво, закуски и сопутствующие товары.</p>

    <h3>Доставка алкоголя 24/7 и ночью</h3>
    <p><strong>Доставка алкоголя 24 7</strong>, <strong>доставка алкоголя 24 7 Москва</strong>, <strong>доставка алкоголя 24 часа</strong>, <strong>доставка алкоголя на дом круглосуточно</strong>, <strong>доставка алкоголя в Москве круглосуточно</strong>, <strong>доставка алкоголя на дом 24</strong>, <strong>доставка алкоголя на дом 24 7</strong>, <strong>доставка алкоголя Москва 24 7 на дом</strong> и <strong>ночная доставка алкоголя</strong> — отдельная группа запросов. Если нужна <strong>доставка алкоголя ночью в Москве</strong> или <strong>доставка алкоголя ночью на дом</strong>, заявка принимается круглосуточно. Фактическое время зависит от района, загрузки дорог и наличия выбранных позиций.</p>

    <h3>Доставка алкоголя по Московской области</h3>
    <p>Помимо Москвы работает <strong>доставка алкоголя Московская область</strong> и <strong>доставка алкоголя на дом Московская область</strong>. Часто ищут <strong>доставка алкоголя Мытищи</strong>, <strong>доставка алкоголя Красногорск</strong>, <strong>доставка алкоголя Одинцово</strong>, <strong>доставка алкоголя Королев</strong>, <strong>доставка алкоголя Химки</strong>, <strong>доставка алкоголя Домодедово</strong>, <strong>доставка алкоголя Подольск</strong>, <strong>доставка алкоголя Люберцы</strong>, <strong>доставка алкоголя Чехов</strong>, <strong>доставка алкоголя Серпухов</strong>, <strong>доставка алкоголя Сергиев Посад</strong>, <strong>доставка алкоголя Щелково</strong>, <strong>доставка алкоголя Балашиха</strong>, <strong>доставка алкоголя Пушкино</strong> и <strong>алкоголь Зеленоград доставка</strong>. Возможность и стоимость доставки за МКАД уточняются при подтверждении заказа.</p>

    <h3>Купить алкоголь с доставкой: водка, виски, пиво</h3>
    <p>В товарном кластере встречаются запросы <strong>доставка алкоголя виски</strong>, <strong>доставка алкоголя водка</strong>, <strong>доставка пива алкоголь</strong> и <strong>доставка сигарет и алкоголя</strong>. Для выбора напитков используйте каталог: там собраны категории крепкого алкоголя, вина, игристого, пива и закусок. По запросам <strong>магазин доставки алкоголя</strong>, <strong>магазин доставка алкоголя на дом</strong> и <strong>алкоголь доставка недорого</strong> главная страница ведёт в общий каталог LIQO.</p>

    <h3>Можно ли заказать алкоголь с доставкой</h3>
    <p>В Wordstat заметен информационный кластер: <strong>доставка алкоголя можно</strong>, <strong>доставка алкоголя можно ли</strong>, <strong>можно ли в доставке заказать алкоголь</strong>, <strong>где можно заказать доставку алкоголя</strong>, <strong>доставка алкоголя на дом можно ли</strong> и <strong>можно ли заказывать алкоголь доставкой на дом</strong>. На сайте LIQO оформление доступно только совершеннолетним пользователям 18+. Условия передачи заказа, доступность конкретного адреса и ассортимент подтверждает оператор.</p>

    <h3>Доставка алкоголя Москва 24 — популярные формулировки поиска</h3>
    <p>Для экспериментальной проверки Яндекса на странице намеренно используются близкие высокочастотные формулировки: <strong>доставка алкоголя</strong>, <strong>доставка алкоголя Москва</strong>, <strong>доставка алкоголя на дом</strong>, <strong>доставка алкоголя 24</strong>, <strong>доставка алкоголя круглосуточно</strong>, <strong>доставка алкоголя Москва 24</strong>, <strong>доставка алкоголя ночью</strong>, <strong>доставка алкоголя на дом в Москве</strong>, <strong>доставка алкоголя 24 7</strong>, <strong>заказать алкоголь с доставкой</strong>, <strong>купить алкоголь с доставкой</strong>, <strong>доставка алкоголя Московская область</strong>, <strong>доставка алкоголя на дом круглосуточно</strong>, <strong>доставка алкоголя ночью в Москве</strong>, <strong>доставка алкоголя 24 часа</strong>. Этот текст является видимым и не скрывается от пользователей или поисковых роботов.</p>
  </div>
</section>
${END}`;

const insertionPoint = '<section class="cta">';
if (html.includes(insertionPoint)) {
  html = html.replace(insertionPoint, `${block}\n        ${insertionPoint}`);
} else {
  html = html.replace('</main>', `${block}\n</main>`);
}

fs.writeFileSync(file, html, 'utf8');
console.log('wordstat-spam-experiment: homepage title, h1 and visible keyword block applied');
