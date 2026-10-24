<?php
// ======================================================================
// CATEGORIES ROUTE HANDLER
// ======================================================================

function handle_categories($method, $segments) {
    $db = get_db_connection();

    if ($method === 'GET') {
        $stmt = $db->query("
            SELECT 
                c.id, 
                c.name, 
                c.slug, 
                c.image, 
                c.sort_order,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id
            ORDER BY c.sort_order ASC, c.name ASC
        ");
        $categories = $stmt->fetchAll();

        // Format to match frontend structure
        $formatted = array_map(function($cat) {
            return [
                'id'          => (int)$cat['id'],
                'name'        => $cat['name'],
                'slug'        => $cat['slug'],
                'imageUrl'    => $cat['image'] ?? '',
                'sortOrder'   => (int)$cat['sort_order'],
                '_count'      => [
                    'products' => (int)$cat['product_count']
                ]
            ];
        }, $categories);

        json_response($formatted);
    }

    json_response(['error' => 'Method not allowed'], 405);
}
