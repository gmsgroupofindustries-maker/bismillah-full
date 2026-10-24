<?php
// ======================================================================
// ORDERS ROUTE HANDLER (CHECKOUT, TRACKING & ADMIN MANAGEMENT)
// ======================================================================

require_once __DIR__ . '/../middleware/auth.php';

function handle_orders($method, $segments) {
    $db = get_db_connection();
    $sub = $segments[1] ?? '';
    $orderId = $segments[2] ?? '';

    // 1. GET /api/orders/track/:orderNumber
    if ($method === 'GET' && $sub === 'track' && !empty($orderId)) {
        $trackCode = trim($orderId);
        $phone = trim($_GET['phone'] ?? '');

        if (is_numeric($trackCode)) {
            $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
            $stmt->execute([(int)$trackCode]);
        } else {
            $stmt = $db->prepare("SELECT * FROM orders WHERE UPPER(order_number) = ? OR id = ? LIMIT 1");
            $stmt->execute([strtoupper($trackCode), (int)$trackCode]);
        }

        $order = $stmt->fetch();
        if (!$order) {
            json_response(['error' => 'Order not found with the provided details'], 404);
        }

        // Fetch ordered items
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();

        json_response([
            'order' => format_order_row($order, $items),
            'items' => $items,
        ]);
    }

    // 2. ADMIN: GET /api/orders (List orders for admin dashboard)
    if ($method === 'GET' && empty($sub)) {
        require_admin();
        $status = trim($_GET['status'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = max(1, min(100, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $where[] = 'LOWER(status) = ?';
            $params[] = strtolower($status);
        }

        if (!empty($search)) {
            $where[] = '(LOWER(customer_name) LIKE ? OR customer_phone LIKE ? OR LOWER(order_number) LIKE ?)';
            $searchTerm = '%' . strtolower($search) . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereSql = implode(' AND ', $where);

        $countStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $db->prepare("SELECT * FROM orders WHERE $whereSql ORDER BY id DESC LIMIT $limit OFFSET $offset");
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        // Attach items for each order
        $formattedOrders = [];
        foreach ($orders as $o) {
            $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$o['id']]);
            $items = $itemStmt->fetchAll();
            $formattedOrders[] = format_order_row($o, $items);
        }

        json_response([
            'orders'     => $formattedOrders,
            'total'      => $total,
            'page'       => $page,
            'totalPages' => ceil($total / $limit) ?: 1,
            'limit'      => $limit,
        ]);
    }

    // 3. ADMIN: PATCH /api/orders/:id/status
    if (($method === 'PATCH' || $method === 'PUT') && !empty($sub) && ($segments[2] ?? '') === 'status') {
        require_admin();
        $targetId = (int)$sub;
        $body = get_json_body();
        $status = trim(strtolower($body['status'] ?? ''));

        $allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $allowedStatuses, true)) {
            json_response(['error' => 'Invalid status value'], 400);
        }

        $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $targetId]);

        json_response([
            'success' => true,
            'order'   => ['id' => $targetId, 'status' => $status]
        ]);
    }

    // 4. POST /api/orders (Customer Place Order / Checkout)
    if ($method === 'POST') {
        $body = get_json_body();

        // Support both schema styles: { customerName, customerPhone, items: [...] } or { customer: {...}, items: [...] }
        $custName = trim($body['customerName'] ?? $body['customer']['name'] ?? '');
        $custPhone = trim($body['customerPhone'] ?? $body['customer']['phone'] ?? '');
        $custWhatsapp = trim($body['customerWhatsapp'] ?? $custPhone);
        $custAddress = trim($body['customerAddress'] ?? $body['customer']['address'] ?? '');
        $custDistrict = trim($body['customerDistrict'] ?? $body['customer']['district'] ?? 'Jashore');
        $notes = trim($body['notes'] ?? '');
        $paymentMethod = trim($body['paymentMethod'] ?? 'cod');
        $rawItems = $body['items'] ?? [];

        if (empty($custName) || empty($custPhone) || empty($custAddress) || empty($rawItems)) {
            json_response([
                'error' => 'Please provide customer name, phone number, delivery address, and at least one item.'
            ], 400);
        }

        $isInsideJashore = (strtolower(trim($custDistrict)) === 'jashore');
        $deliveryFee = $isInsideJashore ? 60.00 : 130.00;

        $db->beginTransaction();
        try {
            $subtotal = 0;
            $processedItems = [];

            foreach ($rawItems as $rawItem) {
                $pid = (int)($rawItem['productId'] ?? $rawItem['id'] ?? 0);
                $qty = max(1, (int)($rawItem['quantity'] ?? $rawItem['qty'] ?? 1));

                $pStmt = $db->prepare("SELECT id, name, price, sku FROM products WHERE id = ? LIMIT 1");
                $pStmt->execute([$pid]);
                $product = $pStmt->fetch();

                $itemName = $product ? $product['name'] : ($rawItem['name'] ?? 'Motorcycle Part');
                $itemPrice = $product ? (float)$product['price'] : (float)($rawItem['price'] ?? 0);
                $itemSku = $product ? ($product['sku'] ?? 'BM-N/A') : 'BM-N/A';
                $lineSubtotal = $itemPrice * $qty;
                $subtotal += $lineSubtotal;

                $processedItems[] = [
                    'product_id'   => $pid ?: null,
                    'product_name' => $itemName,
                    'product_sku'  => $itemSku,
                    'price'        => $itemPrice,
                    'qty'          => $qty,
                    'subtotal'     => $lineSubtotal,
                ];
            }

            $total = $subtotal + $deliveryFee;
            $orderNumber = 'BM-' . date('ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $orderStmt = $db->prepare("
                INSERT INTO orders 
                (order_number, customer_name, customer_phone, customer_address, district, total, delivery_fee, payment_method, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            ");
            $orderStmt->execute([
                $orderNumber, $custName, $custPhone, $custAddress, $custDistrict,
                $total, $deliveryFee, $paymentMethod, $notes
            ]);

            $orderId = (int)$db->lastInsertId();

            $itemInsert = $db->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, price, qty)
                VALUES (?, ?, ?, ?, ?)
            ");

            foreach ($processedItems as $item) {
                $itemInsert->execute([
                    $orderId,
                    $item['product_id'],
                    $item['product_name'],
                    $item['price'],
                    $item['qty']
                ]);
            }

            $db->commit();

            // Build WhatsApp order confirmation link
            $storePhone = defined('STORE_PHONE') ? STORE_PHONE : '8801974060224';
            $msg = "🏍️ *New Order from Bismillah Motors Website!*\n\n";
            $msg .= "*Order ID:* {$orderNumber}\n";
            $msg .= "*Customer:* {$custName}\n";
            $msg .= "*Phone:* {$custPhone}\n";
            $msg .= "*Address:* {$custAddress}, {$custDistrict}\n\n";
            $msg .= "*Ordered Items:*\n";
            foreach ($processedItems as $idx => $it) {
                $num = $idx + 1;
                $msg .= "{$num}. {$it['product_name']} (x{$it['qty']}) - ৳{$it['subtotal']}\n";
            }
            $msg .= "\n*Delivery Fee:* ৳{$deliveryFee} ({$custDistrict})";
            $msg .= "\n*Total Amount:* ৳{$total}";
            if (!empty($notes)) {
                $msg .= "\n*Special Note:* {$notes}";
            }
            $msg .= "\n\n*Payment Method:* Cash on Delivery (ক্যাশ অন ডেলিভারি)";

            $whatsappUrl = "https://wa.me/{$storePhone}?text=" . rawurlencode($msg);

            $orderData = [
                'id'              => $orderId,
                'orderNumber'     => $orderNumber,
                'customerName'    => $custName,
                'customerPhone'   => $custPhone,
                'customerWhatsapp'=> $custWhatsapp,
                'customerAddress' => $custAddress,
                'customerDistrict'=> $custDistrict,
                'notes'           => $notes,
                'totalAmount'     => $total,
                'deliveryFee'     => $deliveryFee,
                'status'          => 'PENDING',
                'createdAt'       => date('c'),
                'items'           => $processedItems,
            ];

            json_response([
                'success'         => true,
                'orderId'         => $orderId,
                'orderNumber'     => $orderNumber,
                'order'           => $orderData,
                'message'         => 'Order placed successfully! We will contact you soon for confirmation.',
                'whatsappMessage' => $msg,
                'whatsappUrl'     => $whatsappUrl,
            ], 201);

        } catch (Exception $e) {
            $db->rollBack();
            json_response(['error' => 'Failed to place order: ' . $e->getMessage()], 500);
        }
    }

    json_response(['error' => 'Method not allowed'], 405);
}

function format_order_row($row, $items = []) {
    $formattedItems = [];
    foreach ($items as $it) {
        $price = (float)$it['price'];
        $qty = (int)($it['qty'] ?? 1);
        $formattedItems[] = [
            'id'          => (int)$it['id'],
            'orderId'     => (int)$it['order_id'],
            'productId'   => $it['product_id'] ? (int)$it['product_id'] : null,
            'productName' => $it['product_name'],
            'productSku'  => $it['product_sku'] ?? 'N/A',
            'price'       => $price,
            'quantity'    => $qty,
            'subtotal'    => $price * $qty,
        ];
    }

    return [
        'id'              => (int)$row['id'],
        'orderNumber'     => $row['order_number'] ?? ('BM-' . $row['id']),
        'customerName'    => $row['customer_name'],
        'customerPhone'   => $row['customer_phone'],
        'customerWhatsapp'=> $row['customer_phone'],
        'customerAddress' => $row['customer_address'],
        'customerDistrict'=> $row['district'] ?? 'Jashore',
        'notes'           => $row['notes'] ?? '',
        'totalAmount'     => (float)$row['total'],
        'deliveryFee'     => (float)($row['delivery_fee'] ?? 60),
        'status'          => strtoupper($row['status'] ?? 'PENDING'),
        'paymentMethod'   => $row['payment_method'] ?? 'cod',
        'createdAt'       => $row['created_at'] ?? '',
        'updatedAt'       => $row['updated_at'] ?? '',
        'items'           => $formattedItems,
    ];
}
