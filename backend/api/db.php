<?php
// ======================================================================
// BISMILLAH MOTORS - PDO DATABASE CONNECTION HELPER
// ======================================================================

require_once __DIR__ . '/config.php';

function get_db_connection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        DB_HOST,
        defined('DB_PORT') ? DB_PORT : '3306',
        DB_NAME,
        defined('DB_CHARSET') ? DB_CHARSET : 'utf8mb4'
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'Database connection failed: ' . $e->getMessage(),
            'hint'  => 'Please verify DB_HOST, DB_NAME, DB_USER, and DB_PASS in api/config.php'
        ]);
        exit;
    }
}
