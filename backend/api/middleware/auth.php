<?php
// ======================================================================
// BISMILLAH MOTORS - ADMIN AUTHENTICATION MIDDLEWARE
// ======================================================================

require_once __DIR__ . '/../helpers.php';

function require_admin() {
    $auth = '';

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (empty($auth)) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }

    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)) {
        json_response([
            'error' => 'Missing or invalid Authorization header (Bearer token required)'
        ], 401);
    }

    $token = trim($matches[1]);
    $payload = jwt_decode($token);

    if (!$payload || ($payload['role'] ?? '') !== 'admin') {
        json_response([
            'error' => 'Invalid, expired or unauthorized admin session. Please log in again.'
        ], 401);
    }

    $GLOBALS['current_user'] = $payload;
    return $payload;
}
