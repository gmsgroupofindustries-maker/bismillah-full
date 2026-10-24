<?php
// ======================================================================
// BISMILLAH MOTORS - UTILITY & JWT HELPERS (NO EXTERNAL COMPOSER LIBS)
// ======================================================================

function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode($payload) {
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = base64url_encode(json_encode($payload));
    $sig = hash_hmac('sha256', $header . '.' . $body, JWT_SECRET, true);
    return $header . '.' . $body . '.' . base64url_encode($sig);
}

function jwt_decode($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', $header . '.' . $body, JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) {
        return null;
    }
    $payload = json_decode(base64url_decode($body), true);
    if (!is_array($payload)) {
        return null;
    }
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null; // Expired
    }
    return $payload;
}

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'item-' . time() : $text;
}
