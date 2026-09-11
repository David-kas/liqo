import { next } from '@vercel/functions';

// Не используем fetch(request): на Vercel это повторно запускает Routing Middleware.
// Для продолжения запроса используем официальный helper next().
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon|site.webmanifest|.*\\.(?:css|js|mjs|json|xml|txt|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|map)$).*)'],
};

const BOT_PATTERN = /Googlebot|Google-InspectionTool|Googlebot-Image|Googlebot-Video|AdsBot-Google|Mediapartners-Google|GoogleOther|YandexBot|YandexMobileBot|YandexVideo|YandexImages|YandexAccessibilityBot|YandexDirect|YandexBlogs|YandexMirrorDetector|YandexMedia|YandexWebmaster|YandexCalendar|YandexNews|YandexTurbo|Bingbot|Baiduspider|DuckDuckBot|Slurp|FacebookBot|Twitterbot|Applebot|AhrefsBot|SemrushBot|MJ12bot|DotBot|Yeti|NaverBot|Yahoo!\sSlurp|ia_archiver|rogerbot|exabot|spider|crawler|scanner|checker|validator|bot/i;
const MOBILE_PATTERN = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_PATTERN.test(userAgent);
  const isMobile = MOBILE_PATTERN.test(userAgent);

  // Роботы и мобильные пользователи получают настоящий сайт.
  if (isBot || isMobile) return next();

  // Обычный доступ с ПК блокируем. Никаких redirect/fetch-loop.
  return new Response(
    '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ошибка 404</title></head><body><h1>Ошибка 404</h1><p>Страница не существует.</p></body></html>',
    {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
