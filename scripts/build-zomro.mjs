/**
 * Сборка production-папки LIQO-ZOMRO для загрузки на хостинг Zomro.
 * Запуск: node scripts/build-zomro.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'LIQO-ZOMRO');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  '.vercel',
  'LIQO-ZOMRO',
  '_import-images',
  'scripts',
  'telegram',
  'vodka',
  'viski',
  'vino',
  'vermut',
  'tekila',
  'rom',
  'shampanskoe',
  'sigarety',
]);

const EXCLUDE_ROOT_HTML = new Set([
  'vodka.html',
  'viski.html',
  'vino.html',
  'vermut.html',
  'tekila.html',
  'rom.html',
  'shampanskoe.html',
  'sigarety.html',
]);

const EXCLUDE_FILES = new Set([
  'vercel.json',
  'package.json',
  'package-lock.json',
  'README.md',
  '.gitignore',
]);

const EXCLUDE_EXT = /\.(mjs|ts|map)$/i;

function shouldCopy(rel) {
  const parts = rel.split(/[/\\]/);
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return false;
  const base = path.basename(rel);
  if (EXCLUDE_FILES.has(base)) return false;
  if (parts.length === 1 && EXCLUDE_ROOT_HTML.has(base)) return false;
  if (EXCLUDE_EXT.test(base)) return false;
  if (base.startsWith('script.') && !base.endsWith('.min.js') && base !== 'script.js') return false;
  if (base === 'style.css' && fs.existsSync(path.join(ROOT, 'style.min.css'))) return false;
  if (base === 'script.js' && fs.existsSync(path.join(ROOT, 'script.min.js'))) return false;
  if (base === 'script.catalog.js' && fs.existsSync(path.join(ROOT, 'script.catalog.min.js'))) return false;
  if (rel.replace(/\\/g, '/').startsWith('api/telegram.js')) return false;
  if (rel.replace(/\\/g, '/').startsWith('api/send-telegram.js')) return false;
  return true;
}

function copyDir(src, dest, rel = '') {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name);
    const relPath = rel ? `${rel}/${name}` : name;
    if (!shouldCopy(relPath)) continue;
    const st = fs.statSync(srcPath);
    const destPath = path.join(dest, name);
    if (st.isDirectory()) {
      copyDir(srcPath, destPath, relPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(OUT)) {
  fs.rmSync(OUT, { recursive: true, force: true });
}

copyDir(ROOT, OUT);

/* Production: только minified CSS/JS где есть */
for (const [src, drop] of [
  ['style.css', 'style.css'],
  ['script.js', 'script.js'],
  ['script.catalog.js', 'script.catalog.js'],
]) {
  const min = src.replace('.css', '.min.css').replace('.js', '.min.js');
  if (fs.existsSync(path.join(ROOT, min))) {
    const p = path.join(OUT, drop);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

const deploy = `LIQO.PRO — деплой на Zomro
================================

1. ФАЙЛЫ ДЛЯ ЗАГРУЗКИ
   Загрузите ВСЁ содержимое этой папки (LIQO-ZOMRO) в корень сайта на Zomro
   (обычно public_html или www для домена liqo.pro).

2. ДИРЕКТОРИЯ
   /public_html/  или  /www/liqo.pro/  — корень домена liqo.pro

3. ДОМЕН
   В панели Zomro привяжите домен liqo.pro к этой директории.
   Основной адрес: https://liqo.pro/ (без www).

4. SSL
   В панели Zomro включите бесплатный Let's Encrypt для liqo.pro.
   После выпуска сертификата .htaccess перенаправит HTTP → HTTPS.

5. TELEGRAM
   Обработчик: /api/order.php
   Настройки: /config/telegram.json
   Поля:
     TELEGRAM_BOT_TOKEN — токен бота
     TELEGRAM_CHAT_ID   — ID чата для заявок
   Файл config/telegram.json защищён .htaccess — не доступен из браузера.
   НИКОГДА не помещайте токен в HTML или JS.

6. ПРАВА
   Файлы: 644
   Папки: 755
   config/telegram.json: 600 (рекомендуется)

7. ТЕСТ ЗАКАЗА
   a) Откройте https://liqo.pro/catalog.html
   b) Добавьте товар в корзину
   c) Оформите заказ (имя + телефон + адрес)
   d) Проверьте сообщение в Telegram
   e) GET https://liqo.pro/api/order.php — должен вернуть {"configured":true}

8. .HTACCESS
   Файл .htaccess в корне — проверьте, что mod_rewrite включён на хостинге.
   Правила: HTTPS, liqo.pro без www, /api/telegram → order.php

9. SITEMAP И ROBOTS
   https://liqo.pro/sitemap.xml
   https://liqo.pro/robots.txt

10. ПРОБЛЕМЫ
    — 500 на order.php: проверьте PHP 7.4+ и curl
    — Заказ не уходит: проверьте config/telegram.json
    — 404 на страницах: загрузите все папки raion/, metro/, kategoria/
`;

fs.writeFileSync(path.join(OUT, 'DEPLOY-ZOMRO.txt'), deploy, 'utf8');
console.log('LIQO-ZOMRO ready:', OUT);
