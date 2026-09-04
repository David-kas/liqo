export default function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Пропускаем статику и API без проверки
  const staticPathPattern = /^\/(favicon|apple-touch-icon|site\.webmanifest|favicon-.*\.png)/i;
  if (staticPathPattern.test(url.pathname)) return fetch(request);
  if (url.pathname.startsWith('/api/')) return fetch(request);

  // Определяем мобильное устройство
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);

  // Поисковые роботы и сервисы проверки должны получать страницы для индексации.
  const botPattern = new RegExp(
    'Googlebot|Google-InspectionTool|Googlebot-Image|Googlebot-Video|' +
    'AdsBot-Google|Mediapartners-Google|GoogleOther|' +
    'YandexBot|YandexMobileBot|YandexVideo|YandexImages|' +
    'YandexAccessibilityBot|YandexDirect|YandexBlogs|YandexMirrorDetector|' +
    'YandexMedia|YandexWebmaster|YandexCalendar|YandexNews|YandexTurbo|' +
    'Bingbot|Baiduspider|DuckDuckBot|Slurp|' +
    'FacebookBot|Twitterbot|Applebot|' +
    'AhrefsBot|SemrushBot|MJ12bot|DotBot|Yeti|NaverBot|' +
    'Yahoo!\\ Slurp|ia_archiver|rogerbot|exabot|' +
    'spider|crawler|scanner|checker|validator|bot',
    'i'
  );

  const isBot = botPattern.test(userAgent);

  // Для обычного доступа с ПК возвращаем стандартную страницу 404.
  if (!isMobile && !isBot) {
    return new Response(
      '<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Ошибка 404</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><h1>Ошибка 404</h1><p>Страница не существует.</p></body></html>',
      { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  return fetch(request);
}
