<?php
// ======================================================================
// PRODUCTS ROUTE HANDLER (FULL CRUD & SEARCH/FILTERING)
// ======================================================================

require_once __DIR__ . '/../middleware/auth.php';

function handle_products($method, $segments) {
    $db = get_db_connection();
    $target = $segments[1] ?? '';
    $subAction = $segments[2] ?? '';

    // 1. GET /api/products/:id_or_slug
    if ($method === 'GET' && !empty($target)) {
        if (is_numeric($target)) {
            $stmt = $db->prepare("
                SELECT p.*, 
                       c.name as category_name, c.slug as category_slug,
                       b.name as brand_name, b.slug as brand_slug,
                       bb.name as bike_brand_name, bb.slug as bike_brand_slug
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN brands b ON b.id = p.brand_id
                LEFT JOIN bike_brands bb ON bb.id = p.bike_brand_id
                WHERE p.id = ? LIMIT 1
            ");
            $stmt->execute([(int)$target]);
        } else {
            $stmt = $db->prepare("
                SELECT p.*, 
                       c.name as category_name, c.slug as category_slug,
                       b.name as brand_name, b.slug as brand_slug,
                       bb.name as bike_brand_name, bb.slug as bike_brand_slug
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN brands b ON b.id = p.brand_id
                LEFT JOIN bike_brands bb ON bb.id = p.bike_brand_id
                WHERE p.slug = ? LIMIT 1
            ");
            $stmt->execute([$target]);
        }

        $row = $stmt->fetch();
        if (!$row) {
            json_response(['error' => 'Product not found'], 404);
        }

        $product = format_product_row($row);

        // Fetch up to 4 related products from the same category
        $related = [];
        if (!empty($row['category_id'])) {
            $relStmt = $db->prepare("
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                WHERE p.category_id = ? AND p.id != ?
                LIMIT 4
            ");
            $relStmt->execute([$row['category_id'], $row['id']]);
            $relRows = $relStmt->fetchAll();
            $related = array_map('format_product_row', $relRows);
        }

        json_response([
            'product'         => $product,
            'relatedProducts' => $related,
        ]);
    }

    // 2. GET /api/products (List with filters & pagination)
    if ($method === 'GET' && empty($target)) {
        $page       = max(1, (int)($_GET['page'] ?? 1));
        $limit      = max(1, min(100, (int)($_GET['limit'] ?? 16)));
        $offset     = ($page - 1) * $limit;

        $category   = trim($_GET['category'] ?? '');
        $brand      = trim($_GET['brand'] ?? '');
        $bikeBrand  = trim($_GET['bike_brand'] ?? $_GET['bikeBrand'] ?? '');
        $search     = trim($_GET['search'] ?? '');
        $minPrice   = isset($_GET['min_price']) || isset($_GET['minPrice']) ? (float)($_GET['min_price'] ?? $_GET['minPrice']) : null;
        $maxPrice   = isset($_GET['max_price']) || isset($_GET['maxPrice']) ? (float)($_GET['max_price'] ?? $_GET['maxPrice']) : null;
        $sort       = trim($_GET['sort'] ?? 'newest');
        $inStock    = isset($_GET['inStock']) && $_GET['inStock'] === 'true';
        $isFeatured = isset($_GET['isFeatured']) && $_GET['isFeatured'] === 'true';
        $isPopular  = isset($_GET['isPopular']) && $_GET['isPopular'] === 'true';

        $where = ['1=1'];
        $params = [];

        if (!empty($category)) {
            $where[] = 'LOWER(c.slug) = ?';
            $params[] = strtolower($category);
        }

        if (!empty($brand)) {
            $where[] = 'LOWER(b.slug) = ?';
            $params[] = strtolower($brand);
        }

        if (!empty($bikeBrand)) {
            $where[] = '(LOWER(bb.slug) = ? OR LOWER(bb.name) = ?)';
            $params[] = strtolower($bikeBrand);
            $params[] = strtolower($bikeBrand);
        }

        if (!empty($search)) {
            $where[] = '(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.sku) LIKE ?)';
            $searchTerm = '%' . strtolower($search) . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if ($minPrice !== null) {
            $where[] = 'p.price >= ?';
            $params[] = $minPrice;
        }

        if ($maxPrice !== null) {
            $where[] = 'p.price <= ?';
            $params[] = $maxPrice;
        }

        if ($inStock) {
            $where[] = 'p.stock > 0';
        }

        if ($isFeatured) {
            $where[] = 'p.is_featured = 1';
        }

        $whereSql = implode(' AND ', $where);

        // Count total matching items
        $countSql = "
            SELECT COUNT(p.id) as total
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN brands b ON b.id = p.brand_id
            LEFT JOIN bike_brands bb ON bb.id = p.bike_brand_id
            WHERE $whereSql
        ";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)($countStmt->fetchColumn() ?: 0);

        // Sorting
        $orderBy = 'p.id DESC';
        switch ($sort) {
            case 'price-asc':
                $orderBy = 'p.price ASC';
                break;
            case 'price-desc':
                $orderBy = 'p.price DESC';
                break;
            case 'name-asc':
                $orderBy = 'p.name ASC';
                break;
            case 'newest':
            default:
                $orderBy = 'p.id DESC';
                break;
        }

        $dataSql = "
            SELECT p.*, 
                   c.name as category_name, c.slug as category_slug,
                   b.name as brand_name, b.slug as brand_slug,
                   bb.name as bike_brand_name, bb.slug as bike_brand_slug
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN brands b ON b.id = p.brand_id
            LEFT JOIN bike_brands bb ON bb.id = p.bike_brand_id
            WHERE $whereSql
            ORDER BY $orderBy
            LIMIT $limit OFFSET $offset
        ";
        $dataStmt = $db->prepare($dataSql);
        $dataStmt->execute($params);
        $rows = $dataStmt->fetchAll();

        $products = array_map('format_product_row', $rows);
        $totalPages = ceil($total / $limit) ?: 1;

        json_response([
            'products'   => $products,
            'total'      => $total,
            'page'       => $page,
            'totalPages' => $totalPages,
            'limit'      => $limit,
        ]);
    }

    // 3. ADMIN: POST /api/products (Create)
    if ($method === 'POST' && empty($target)) {
        require_admin();
        $body = get_json_body();

        $name = trim($body['name'] ?? '');
        $price = (float)($body['price'] ?? 0);

        if (empty($name) || $price <= 0) {
            json_response(['error' => 'Product name and valid price are required'], 400);
        }

        $slug = !empty($body['slug']) ? slugify($body['slug']) : slugify($name);
        $sku = trim($body['sku'] ?? ('BM-' . time()));
        $description = trim($body['description'] ?? '');
        $stock = max(0, (int)($body['stock'] ?? 10));
        $categoryId = !empty($body['categoryId']) ? (int)$body['categoryId'] : null;
        $brandId = !empty($body['brandId']) ? (int)$body['brandId'] : null;
        $bikeBrandId = !empty($body['bikeBrandId']) ? (int)$body['bikeBrandId'] : null;
        $image = trim($body['imageUrl'] ?? $body['image'] ?? '');
        $isFeatured = !empty($body['isFeatured']) ? 1 : 0;

        $stmt = $db->prepare("
            INSERT INTO products 
            (name, slug, description, price, stock, category_id, brand_id, bike_brand_id, image, sku, is_featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $name, $slug, $description, $price, $stock, 
            $categoryId, $brandId, $bikeBrandId, $image, $sku, $isFeatured
        ]);

        $newId = (int)$db->lastInsertId();
        json_response([
            'success' => true,
            'product' => [
                'id' => $newId,
                'name' => $name,
                'slug' => $slug,
                'price' => $price,
                'stock' => $stock
            ]
        ], 201);
    }

    // 4. ADMIN: PUT /api/products/:id/stock (Stock update)
    if (($method === 'PUT' || $method === 'PATCH') && !empty($target) && $subAction === 'stock') {
        require_admin();
        $body = get_json_body();
        $stock = max(0, (int)($body['stock'] ?? 0));

        $stmt = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");
        $stmt->execute([$stock, (int)$target]);

        json_response(['success' => true, 'id' => (int)$target, 'stock' => $stock]);
    }

    // 5. ADMIN: PUT /api/products/:id (Update)
    if ($method === 'PUT' && !empty($target)) {
        require_admin();
        $body = get_json_body();

        $name = trim($body['name'] ?? '');
        $price = (float)($body['price'] ?? 0);
        $stock = max(0, (int)($body['stock'] ?? 0));
        $description = trim($body['description'] ?? '');
        $categoryId = !empty($body['categoryId']) ? (int)$body['categoryId'] : null;
        $brandId = !empty($body['brandId']) ? (int)$body['brandId'] : null;
        $bikeBrandId = !empty($body['bikeBrandId']) ? (int)$body['bikeBrandId'] : null;
        $image = trim($body['imageUrl'] ?? $body['image'] ?? '');
        $isFeatured = !empty($body['isFeatured']) ? 1 : 0;

        $stmt = $db->prepare("
            UPDATE products SET
                name = ?, description = ?, price = ?, stock = ?,
                category_id = ?, brand_id = ?, bike_brand_id = ?,
                image = ?, is_featured = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $name, $description, $price, $stock,
            $categoryId, $brandId, $bikeBrandId,
            $image, $isFeatured, (int)$target
        ]);

        json_response(['success' => true, 'id' => (int)$target]);
    }

    // 6. ADMIN: DELETE /api/products/:id
    if ($method === 'DELETE' && !empty($target)) {
        require_admin();
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([(int)$target]);
        json_response(['success' => true, 'id' => (int)$target]);
    }

    json_response(['error' => 'Method not allowed'], 405);
}

function format_product_row($row) {
    $primaryImg = $row['image'] ?? '';
    $imagesList = [];
    if (!empty($row['images'])) {
        $decoded = json_decode($row['images'], true);
        if (is_array($decoded)) {
            $imagesList = $decoded;
        }
    }
    if (empty($imagesList) && !empty($primaryImg)) {
        $imagesList = [['id' => 1, 'url' => $primaryImg, 'isPrimary' => true]];
    }

    return [
        'id'            => (int)$row['id'],
        'name'          => $row['name'],
        'slug'          => $row['slug'],
        'sku'           => $row['sku'] ?? ('BM-' . $row['id']),
        'description'   => $row['description'] ?? '',
        'price'         => (float)$row['price'],
        'discountPrice' => isset($row['discount_price']) ? (float)$row['discount_price'] : null,
        'stock'         => (int)($row['stock'] ?? 0),
        'isFeatured'    => (bool)($row['is_featured'] ?? false),
        'isPopular'     => (bool)($row['is_popular'] ?? false),
        'categoryId'    => $row['category_id'] ? (int)$row['category_id'] : null,
        'brandId'       => $row['brand_id'] ? (int)$row['brand_id'] : null,
        'bikeBrandId'   => $row['bike_brand_id'] ? (int)$row['bike_brand_id'] : null,
        'bikeModelId'   => isset($row['bike_model_id']) ? (int)$row['bike_model_id'] : null,
        'category'      => $row['category_name'] ? [
            'id'   => (int)$row['category_id'],
            'name' => $row['category_name'],
            'slug' => $row['category_slug'] ?? ''
        ] : null,
        'brand'         => $row['brand_name'] ? [
            'id'   => (int)$row['brand_id'],
            'name' => $row['brand_name'],
            'slug' => $row['brand_slug'] ?? ''
        ] : null,
        'bikeBrand'     => $row['bike_brand_name'] ? [
            'id'   => (int)$row['bike_brand_id'],
            'name' => $row['bike_brand_name'],
            'slug' => $row['bike_brand_slug'] ?? ''
        ] : null,
        'images'        => $imagesList,
        'createdAt'     => $row['created_at'] ?? '',
        'updatedAt'     => $row['updated_at'] ?? '',
    ];
}
