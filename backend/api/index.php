<?php
// ======================================================================
// BISMILLAH MOTORS - PHP API FRONT CONTROLLER & ROUTER
// ======================================================================

// CORS & HTTP Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/middleware/auth.php';

// Resolve requested path
$path = $_GET['path'] ?? '';
if (empty($path) && !empty($_SERVER['PATH_INFO'])) {
    $path = $_SERVER['PATH_INFO'];
}
$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];
$segments = $path !== '' ? explode('/', $path) : [];

$primaryRoute = $segments[0] ?? '';

switch ($primaryRoute) {
    case 'products':
        require_once __DIR__ . '/routes/products.php';
        handle_products($method, $segments);
        break;

    case 'orders':
        require_once __DIR__ . '/routes/orders.php';
        handle_orders($method, $segments);
        break;

    case 'auth':
        require_once __DIR__ . '/routes/auth.php';
        handle_auth($method, $segments);
        break;

    case 'categories':
        require_once __DIR__ . '/routes/categories.php';
        handle_categories($method, $segments);
        break;

    case 'brands':
        require_once __DIR__ . '/routes/brands.php';
        handle_brands($method, $segments);
        break;

    case 'bike-brands':
        require_once __DIR__ . '/routes/bike_brands.php';
        handle_bike_brands($method, $segments);
        break;

    case 'districts':
        $districts = [
            'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur',
            'Chattogram', 'Chuadanga', 'Cox\'s Bazar', 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
            'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah',
            'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat',
            'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon',
            'Narail', 'Narayanganj', 'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna',
            'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira',
            'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
        ];
        json_response([
            'districts' => $districts,
            'shopInfo'  => [
                'name'               => defined('STORE_NAME') ? STORE_NAME : 'Bismillah Motors',
                'district'           => 'Jashore',
                'insideDeliveryFee'  => 60,
                'outsideDeliveryFee' => 130,
                'phone'              => defined('STORE_PHONE') ? ('+' . STORE_PHONE) : '+8801974060224',
                'whatsapp'           => defined('STORE_PHONE') ? STORE_PHONE : '8801974060224',
                'address'            => defined('STORE_ADDRESS') ? STORE_ADDRESS : 'Jashore Sadar, 7400, Bangladesh',
            ]
        ]);
        break;

    case 'admin':
        require_admin();
        $adminSub = $segments[1] ?? '';

        if ($adminSub === 'dashboard') {
            $db = get_db_connection();
            $prodCount = (int)$db->query("SELECT COUNT(*) FROM products")->fetchColumn();
            $orderCount = (int)$db->query("SELECT COUNT(*) FROM orders")->fetchColumn();
            $pendingOrders = (int)$db->query("SELECT COUNT(*) FROM orders WHERE LOWER(status) = 'pending'")->fetchColumn();
            $revenue = (float)$db->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE LOWER(status) IN ('confirmed', 'shipped', 'delivered')")->fetchColumn();

            json_response([
                'totalProducts' => $prodCount,
                'totalOrders'   => $orderCount,
                'pendingOrders' => $pendingOrders,
                'totalRevenue'  => $revenue,
            ]);
        }

        if ($adminSub === 'orders') {
            require_once __DIR__ . '/routes/orders.php';
            handle_orders($method, ['orders']);
        }

        if ($adminSub === 'products') {
            require_once __DIR__ . '/routes/products.php';
            $pId = $segments[2] ?? '';
            handle_products($method, ['products', $pId]);
        }

        json_response(['error' => 'Invalid admin route'], 404);
        break;

    default:
        json_response([
            'status'  => 'online',
            'message' => 'Bismillah Motors PHP API is running successfully',
            'path'    => $path,
            'version' => '2.0.0'
        ], 200);
}
