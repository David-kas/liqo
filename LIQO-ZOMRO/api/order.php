<?php
/**
 * LIQO — серверный обработчик заказов для Telegram Bot API (Zomro / Apache + PHP).
 * Токен хранится только в config/telegram.json — не отдавать клиенту.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configPath = dirname(__DIR__) . '/config/telegram.json';

function loadTelegramConfig(string $path): array
{
    if (!is_readable($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function getCredentials(string $configPath): array
{
    $file = loadTelegramConfig($configPath);
    $token = trim((string)($file['TELEGRAM_BOT_TOKEN'] ?? getenv('TELEGRAM_BOT_TOKEN') ?: ''));
    $chatId = trim((string)($file['TELEGRAM_CHAT_ID'] ?? getenv('TELEGRAM_CHAT_ID') ?: ''));
    return ['token' => $token, 'chatId' => $chatId];
}

function jsonResponse(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitizeForTelegram($text): string
{
    if ($text === null || $text === '') {
        return '—';
    }
    $s = preg_replace('/[\x00-\x1F\\\\]/u', ' ', (string)$text);
    if ($s === null) {
        $s = (string)$text;
    }
    return mb_substr($s, 0, 2000);
}

function formatRub($n): string
{
    $num = (float)$n;
    return number_format($num, 0, '.', ' ') . ' ₽';
}

function buildOrderMessage(array $data): string
{
    $name = sanitizeForTelegram($data['name'] ?? '');
    $phone = sanitizeForTelegram($data['phone'] ?? '');
    $comment = sanitizeForTelegram($data['comment'] ?? '');
    $address = sanitizeForTelegram($data['address'] ?? '');
    $source = sanitizeForTelegram($data['source'] ?? 'Сайт');
    $orderType = sanitizeForTelegram($data['orderType'] ?? 'Заявка');
    $pageUrl = sanitizeForTelegram($data['pageUrl'] ?? '');
    $cart = isset($data['cart']) && is_array($data['cart']) ? $data['cart'] : [];

    $message = "📩 {$orderType} — LIQO\n\n";
    $message .= "👤 Имя: {$name}\n";
    $message .= "📞 Телефон: {$phone}\n";

    if ($address !== '' && $address !== '—') {
        $message .= "📍 Адрес: {$address}\n";
    }

    $items = [];
    foreach ($cart as $it) {
        if (!is_array($it) || empty($it['name'])) {
            continue;
        }
        $items[] = $it;
    }

    if (count($items) > 0) {
        $message .= "\n📦 Состав заказа:\n";
        $total = 0;
        foreach ($items as $idx => $it) {
            $qty = max(1, (int)($it['qty'] ?? 1));
            $price = (float)($it['price'] ?? 0);
            $lineTotal = $price * $qty;
            $total += $lineTotal;
            $itemName = sanitizeForTelegram($it['name']);
            $message .= ($idx + 1) . ". {$itemName} × {$qty} — " . formatRub($lineTotal) . "\n";
        }
        $message .= "\n💰 Итого: " . formatRub($total) . "\n";
    }

    if ($comment !== '' && $comment !== '—') {
        $message .= "\n💬 Комментарий: {$comment}\n";
    }

    $tz = new DateTimeZone('Europe/Moscow');
    $now = new DateTime('now', $tz);
    $message .= "\n🕐 Время: " . $now->format('d.m.Y H:i') . "\n";
    $message .= "📍 Источник: {$source}";

    if ($pageUrl !== '' && $pageUrl !== '—') {
        $message .= "\nСтраница: {$pageUrl}";
    }

    return $message;
}

function sendTelegramMessage(string $token, string $chatId, string $text): array
{
    if ($token === '' || $chatId === '') {
        return [
            'ok' => false,
            'error' => 'Telegram не настроен: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в config/telegram.json',
            'code' => 'TELEGRAM_NOT_CONFIGURED',
        ];
    }

    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $text,
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE);

    if ($payload === false) {
        return ['ok' => false, 'error' => 'JSON encode error', 'code' => 'TELEGRAM_ERROR'];
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        curl_close($ch);
        if ($errno || $response === false) {
            return ['ok' => false, 'error' => 'Не удалось связаться с Telegram', 'code' => 'TELEGRAM_NETWORK'];
        }
    } else {
        $ctx = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $payload,
                'timeout' => 15,
            ],
        ]);
        $response = @file_get_contents($url, false, $ctx);
        if ($response === false) {
            return ['ok' => false, 'error' => 'Не удалось связаться с Telegram', 'code' => 'TELEGRAM_NETWORK'];
        }
    }

    $data = json_decode($response, true);
    if (is_array($data) && !empty($data['ok'])) {
        return ['ok' => true];
    }

    return [
        'ok' => false,
        'error' => is_array($data) ? ($data['description'] ?? 'Telegram API error') : 'Telegram API error',
        'code' => 'TELEGRAM_API',
    ];
}

$creds = getCredentials($configPath);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $configured = $creds['token'] !== '' && $creds['chatId'] !== '';
    jsonResponse(200, [
        'ok' => $configured,
        'configured' => $configured,
        'hasToken' => $creds['token'] !== '',
        'hasChatId' => $creds['chatId'] !== '',
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['error' => 'Method not allowed']);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '{}', true);
if (!is_array($body)) {
    jsonResponse(400, ['error' => 'Некорректный JSON', 'code' => 'INVALID_JSON']);
}

$message = $body['message'] ?? null;
$name = trim((string)($body['name'] ?? ''));
$phone = trim((string)($body['phone'] ?? ''));

if (is_string($message) && $message !== '' && $name === '' && $phone === '') {
    $result = sendTelegramMessage($creds['token'], $creds['chatId'], $message);
    if (!empty($result['ok'])) {
        jsonResponse(200, ['success' => true]);
    }
    $status = ($result['code'] ?? '') === 'TELEGRAM_NOT_CONFIGURED' ? 503 : 502;
    jsonResponse($status, ['error' => $result['error'] ?? 'Telegram error', 'code' => $result['code'] ?? 'TELEGRAM_ERROR']);
}

if ($name === '' || $phone === '') {
    jsonResponse(400, ['error' => 'Имя и телефон обязательны', 'code' => 'VALIDATION']);
}

$cartItems = [];
if (isset($body['cart']) && is_array($body['cart'])) {
    foreach ($body['cart'] as $it) {
        if (!is_array($it) || empty($it['name'])) {
            continue;
        }
        $cartItems[] = [
            'name' => mb_substr((string)$it['name'], 0, 200),
            'price' => (float)($it['price'] ?? 0),
            'qty' => max(1, (int)($it['qty'] ?? 1)),
            'image' => isset($it['image']) ? mb_substr((string)$it['image'], 0, 500) : '',
        ];
    }
}

$pageUrl = (string)($body['pageUrl'] ?? '');
if ($pageUrl === '' && !empty($_SERVER['HTTP_REFERER'])) {
    $pageUrl = (string)$_SERVER['HTTP_REFERER'];
}

$text = buildOrderMessage([
    'name' => $name,
    'phone' => $phone,
    'comment' => $body['comment'] ?? '',
    'address' => $body['address'] ?? '',
    'cart' => $cartItems,
    'source' => $body['source'] ?? 'Сайт',
    'orderType' => $body['orderType'] ?? 'Заявка',
    'pageUrl' => $pageUrl,
]);

$result = sendTelegramMessage($creds['token'], $creds['chatId'], $text);

if (!empty($result['ok'])) {
    jsonResponse(200, ['success' => true]);
}

$status = ($result['code'] ?? '') === 'TELEGRAM_NOT_CONFIGURED' ? 503 : 502;
jsonResponse($status, ['error' => $result['error'] ?? 'Telegram error', 'code' => $result['code'] ?? 'TELEGRAM_ERROR']);
