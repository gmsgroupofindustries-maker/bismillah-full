<?php
// ======================================================================
// BIKE BRANDS ROUTE HANDLER
// ======================================================================

function handle_bike_brands($method, $segments) {
    $db = get_db_connection();

    if ($method === 'GET') {
        $stmt = $db->query("
            SELECT id, name, slug, sort_order 
            FROM bike_brands 
            ORDER BY sort_order ASC, name ASC
        ");
        $brands = $stmt->fetchAll();

        // If there is a bike_models table or models column, load them
        $formatted = [];
        foreach ($brands as $bb) {
            $formatted[] = [
                'id'        => (int)$bb['id'],
                'name'      => $bb['name'],
                'slug'      => $bb['slug'],
                'sortOrder' => (int)$bb['sort_order'],
                'models'    => []
            ];
        }

        json_response($formatted);
    }

    json_response(['error' => 'Method not allowed'], 405);
}
