# LIQO — статический сайт + Vercel

Сайт: **https://liqo24.vercel.app**

## Деплой на Vercel (из GitHub)

1. Импортируйте репозиторий на Vercel.
2. Framework Preset: **Other** (статический сайт).
3. В **Environment Variables** добавьте:
   - `TELEGRAM_BOT_TOKEN` — токен бота
   - `TELEGRAM_CHAT_ID` — ID чата, куда приходят заявки
4. Deploy. Основной домен проекта: `liqo24.vercel.app`.

## Форма заявки

Формы с атрибутом `data-telegram-form` отправляют POST на `/api/telegram` (старые скрипты — на `/api/send-telegram`, тот же обработчик).

**На Vercel обязательно** задайте переменные окружения `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`. Секреты не должны храниться в Git.

Локально можно использовать `config/telegram.example.json` без публикации реального токена.

Проверка API: `GET /api/telegram` → `ok/configured` должны отражать наличие переменных окружения.

## Локальная разработка

```bash
npm install
npm run dev
```

`npm run dev` поднимает статику и API `/api/telegram` на порту 3000.

## Генерация SEO-страниц

```bash
npm run generate:seo
```

Перед публикацией `npm run build` автоматически нормализует публичный домен на `https://liqo24.vercel.app`, обновляет robots/sitemap и проверяет отсутствие старых доменов.
