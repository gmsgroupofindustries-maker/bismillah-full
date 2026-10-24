<?php
// ======================================================================
// BRANDS ROUTE HANDLER
// ======================================================================

function handle_brands($method, $segments) {
    $db = get_db_connection();

    if ($method === 'GET') {
        $stmt = $db->query("
            SELECT 
                b.id, 
                b.name, 
                b.slug, 
                b.logo, 
                b.sort_order,
                COUNT(p.id) as product_count
            FROM brands b
            LEFT JOIN products p ON p.brand_id = b.id
            GROUP BY b.id
            ORDER BY b.sort_order ASC, b.name ASC
        ");
        $brands = $stmt->fetchAll();

        $formatted = array_map(function($b) {
            return [
                'id'          => (int)$b['id'],
                'name'        => $b['name'],
                'slug'        => $b['slug'],
                'logoUrl'     => $b['logo'] ?? '',
                'sortOrder'   => (int)$b['sort_order'],
                '_count'      => [
                    'products' => (int)$b['product_count']
                ]
            ];
        }, $brands);

        json_response($formatted);
    }

    json_response(['error' => 'Method not allowed'], 405);
}
