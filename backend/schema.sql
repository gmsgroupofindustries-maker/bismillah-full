-- ==========================================================
-- BISMILLAH MOTORS - FULL CPANEL DATABASE SCHEMA & SEED
-- Compatible with MySQL 5.7+ and MariaDB 10.2+
-- Import via phpMyAdmin -> Import tab
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo VARCHAR(255),
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bike_brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) DEFAULT NULL,
  stock INT DEFAULT 10,
  category_id INT,
  brand_id INT,
  bike_brand_id INT,
  image VARCHAR(500),
  images JSON,
  sku VARCHAR(100),
  is_featured TINYINT(1) DEFAULT 0,
  is_popular TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category_id),
  INDEX idx_brand (brand_id),
  INDEX idx_bike_brand (bike_brand_id),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  district VARCHAR(100) DEFAULT 'Jashore',
  total DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 60.00,
  payment_method VARCHAR(50) DEFAULT 'cod',
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_phone (customer_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100) DEFAULT 'BM-N/A',
  price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- SEED DATA: Default Admin Users (Password: admin123)
-- ----------------------------------------------------------
INSERT INTO admins (email, password_hash, role) VALUES
  ('admin@bismillahmotorsbd.com', '$2y$10$8QaZvG78Gn7BhrBuW/J2TeEU07OQs1PHqijahgZANI4sCM0QnhQOS', 'admin'),
  ('gmsgroupofindustries@gmail.com', '$2y$10$8QaZvG78Gn7BhrBuW/J2TeEU07OQs1PHqijahgZANI4sCM0QnhQOS', 'admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- ----------------------------------------------------------
-- SEED DATA: Categories
-- ----------------------------------------------------------
INSERT INTO categories (id, name, slug, image, sort_order) VALUES
  (9, "Bike Accessories", "accessories", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 1),
  (2, "Brake Parts", "brake-parts", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 2),
  (3, "Chain & Sprocket", "chain-and-sprocket", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80", 3),
  (6, "Clutch & Transmission", "clutch-parts", "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80", 4),
  (4, "Electrical & ECU", "electrical", "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80", 5),
  (19, "Engine Oil & Lubricants", "engine-oil", "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80", 6),
  (1, "Engine Parts", "engine-parts", "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80", 7),
  (5, "Filters", "filters", "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80", 8),
  (7, "Fuel Tank & Body Parts", "body-parts", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 9),
  (14, "Headlight & Lighting", "headlight-and-lighting", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 10),
  (8, "Stickers & Decals", "stickers-and-accessories", "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80", 11),
  (18, "Stickers & Graphics", "stickers", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 12),
  (16, "Suspension & Chassis", "suspension", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80", 13),
  (17, "Tyres & Wheels", "tyres-and-wheels", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80", 14)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- SEED DATA: Brands
-- ----------------------------------------------------------
INSERT INTO brands (id, name, slug, logo, sort_order) VALUES
  (4, "Bajaj Genuine Parts", "bajaj", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80", 1),
  (14, "Hero Genuine Parts", "hero", "", 2),
  (5, "Honda Genuine Parts", "honda", "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=120&q=80", 3),
  (18, "Kayi Corporation", "kayi-corporation", "", 4),
  (7, "MRF", "mrf", "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=120&q=80", 5),
  (16, "Motul", "motul", "", 6),
  (6, "Royal Enfield", "royal-enfield", "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=120&q=80", 7),
  (2, "Suzuki Genuine Parts", "suzuki", "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=120&q=80", 8),
  (3, "TVS Genuine Parts", "tvs", "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=120&q=80", 9),
  (19, "Universal", "universal", "", 10),
  (1, "Yamaha Genuine Parts", "yamaha", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=120&q=80", 11),
  (17, "Yamalube", "yamalube", "", 12)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- SEED DATA: Bike Brands
-- ----------------------------------------------------------
INSERT INTO bike_brands (id, name, slug, sort_order) VALUES
  (4, "Bajaj", "bike-bajaj", 1),
  (8, "Bajaj", "bajaj", 2),
  (11, "Hero", "hero", 3),
  (10, "Honda", "honda", 4),
  (9, "Royal Enfield", "royal-enfield", 5),
  (2, "Suzuki", "bike-suzuki", 6),
  (6, "Suzuki", "suzuki", 7),
  (3, "TVS", "bike-tvs", 8),
  (7, "TVS", "tvs", 9),
  (1, "Yamaha", "bike-yamaha", 10),
  (5, "Yamaha", "yamaha", 11)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- SEED DATA: Sample Products (30 Initial Products)
-- ----------------------------------------------------------
INSERT INTO products (id, name, slug, sku, description, price, discount_price, stock, category_id, brand_id, bike_brand_id, image, images, is_featured, is_popular) VALUES
  (681, "Leg Gard-Bumper (After Market) for Suzuki Gixxer (Old & New Model) bike.", "leg-gard-bumper-after-market-for-suzuki-gixxer-old-new-model-bike-838583", "BM-1655-838583", "100% Genuine and authentic Leg Gard-Bumper (After Market) for Suzuki Gixxer (Old & New Model) bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 850, 1200, 29, 9, 2, 6, "https://assets.zatiqeasy.com/inventories/3122740126070822.jpg", "[{\"id\":681,\"url\":\"https://assets.zatiqeasy.com/inventories/3122740126070822.jpg\",\"isPrimary\":true,\"productId\":681}]", 0, 0),
  (680, "Yamalube 10W40 Racing Gp Motorbike Engine Oil - 1 Liter", "yamalube-10w40-racing-gp-motorbike-engine-oil-1-liter-377725", "BM-1654-377725", "100% Genuine and authentic Yamalube 10W40 Racing Gp Motorbike Engine Oil - 1 Liter. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 2270, 2500, 13, 19, 17, 5, "https://assets.zatiqeasy.com/inventories/17419009714173080.jpg", "[{\"id\":680,\"url\":\"https://assets.zatiqeasy.com/inventories/17419009714173080.jpg\",\"isPrimary\":true,\"productId\":680}]", 0, 0),
  (679, "YAMALUBE OPTIMA PRIME 10W-40 MINERAL 1L.", "yamalube-10w40-full-synthetic-engine-oil-313208", "BM-1653-313208", "100% Genuine and authentic YAMALUBE OPTIMA PRIME 10W-40 MINERAL 1L.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 760, 770, 24, 19, 17, 5, "https://assets.zatiqeasy.com/easy/uploads/50136/inventories/ce/e5/yamalube-10w40-full-synthetic-engine-oil-7869506079744665/original.jpg", "[{\"id\":679,\"url\":\"https://assets.zatiqeasy.com/easy/uploads/50136/inventories/ce/e5/yamalube-10w40-full-synthetic-engine-oil-7869506079744665/original.jpg\",\"isPrimary\":true,\"productId\":679}]", 0, 1),
  (678, "Nagin Bumper (After Market) for Yamaha FZS V2, FZS V3, FZS V4 bike.", "nagin-bumper-after-market-for-yamaha-fzs-v2-fzs-v3-fzs-v4-bike-331097", "BM-1652-331097", "100% Genuine and authentic Nagin Bumper (After Market) for Yamaha FZS V2, FZS V3, FZS V4 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 740, 900, 34, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/21066401531425642.jpg", "[{\"id\":678,\"url\":\"https://assets.zatiqeasy.com/inventories/21066401531425642.jpg\",\"isPrimary\":true,\"productId\":678}]", 0, 0),
  (677, "Bag Hook (CNC-Spring, After Market) for Yamaha FZS V3 (Deluxe), FZS V4 & FZX bike.", "bag-hook-cnc-spring-after-market-for-yamaha-fzs-v3-deluxe-fzs-v4-fzx-bike-339228", "BM-1651-339228", "100% Genuine and authentic Bag Hook (CNC-Spring, After Market) for Yamaha FZS V3 (Deluxe), FZS V4 & FZX bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 300, 350, 23, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/15015956774135579.jpg", "[{\"id\":677,\"url\":\"https://assets.zatiqeasy.com/inventories/15015956774135579.jpg\",\"isPrimary\":true,\"productId\":677}]", 0, 0),
  (676, "Cariel (After Market) for Yamaha FZS & FAZER V2 bike.", "cariel-after-market-for-yamaha-fzs-fazer-v2-bike-341630", "BM-1650-341630", "100% Genuine and authentic Cariel (After Market) for Yamaha FZS & FAZER V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 1450, 2000, 13, 9, 1, 5, "https://assets.zatiqeasy.com/easy/uploads/50136/inventories/73/ae/cariel-after-market-for-yamaha-fzs-fazer-v2-bike-9101825915874213/original.jpg", "[{\"id\":676,\"url\":\"https://assets.zatiqeasy.com/easy/uploads/50136/inventories/73/ae/cariel-after-market-for-yamaha-fzs-fazer-v2-bike-9101825915874213/original.jpg\",\"isPrimary\":true,\"productId\":676}]", 0, 0),
  (675, "Front Name Plate (After Market) for Yamaha bike.", "royal-fork-oil-180-ml-for-all-bike-400865", "BM-1649-400865", "100% Genuine and authentic Front Name Plate (After Market) for Yamaha bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 200, 250, 18, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/725750873731034.jpg", "[{\"id\":675,\"url\":\"https://assets.zatiqeasy.com/inventories/725750873731034.jpg\",\"isPrimary\":true,\"productId\":675}]", 0, 1),
  (674, "Oil Pot Cover (After Market) for Yamaha bike.", "oil-pot-cover-after-market-for-yamaha-bike-402127", "BM-1648-402127", "100% Genuine and authentic Oil Pot Cover (After Market) for Yamaha bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 200, 300, 32, 19, 1, 5, "https://assets.zatiqeasy.com/inventories/19343021291417411.jpg", "[{\"id\":674,\"url\":\"https://assets.zatiqeasy.com/inventories/19343021291417411.jpg\",\"isPrimary\":true,\"productId\":674}]", 0, 0),
  (673, "Oil Pot Cover (After Market) for Suzuki bike.", "oil-pot-cover-after-market-for-suzuki-bike-402128", "BM-1647-402128", "100% Genuine and authentic Oil Pot Cover (After Market) for Suzuki bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 200, 300, 32, 19, 2, 6, "https://assets.zatiqeasy.com/inventories/19342898754476564.jpg", "[{\"id\":673,\"url\":\"https://assets.zatiqeasy.com/inventories/19342898754476564.jpg\",\"isPrimary\":true,\"productId\":673}]", 0, 0),
  (672, "Caliper Cover (After Market) for Yamaha bike.", "caliper-cover-after-market-for-yamaha-bike-402133", "BM-1646-402133", "100% Genuine and authentic Caliper Cover (After Market) for Yamaha bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 210, 300, 19, 2, 1, 5, "https://assets.zatiqeasy.com/inventories/19343937621010351.jpg", "[{\"id\":672,\"url\":\"https://assets.zatiqeasy.com/inventories/19343937621010351.jpg\",\"isPrimary\":true,\"productId\":672}]", 0, 0),
  (671, "Caliper Cover (After Market) for Suzuki bike.", "caliper-cover-after-market-for-suzuki-bike-402138", "BM-1645-402138", "100% Genuine and authentic Caliper Cover (After Market) for Suzuki bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 210, 300, 15, 2, 2, 6, "https://assets.zatiqeasy.com/inventories/19343826624309574.jpg", "[{\"id\":671,\"url\":\"https://assets.zatiqeasy.com/inventories/19343826624309574.jpg\",\"isPrimary\":true,\"productId\":671}]", 0, 1),
  (670, "Visor (After Market) for Yamaha FZX bike.", "visor-after-market-for-yamaha-fzx-bike-402140", "BM-1644-402140", "100% Genuine and authentic Visor (After Market) for Yamaha FZX bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 850, 1000, 30, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/19342539899494426.jpg", "[{\"id\":670,\"url\":\"https://assets.zatiqeasy.com/inventories/19342539899494426.jpg\",\"isPrimary\":true,\"productId\":670}]", 0, 0),
  (669, "Headlight Cover (After Market) for Yamaha FZX bike.", "headlight-cover-after-market-for-yamaha-fzx-bike-395707", "BM-1643-395707", "100% Genuine and authentic Headlight Cover (After Market) for Yamaha FZX bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 400, 500, 27, 14, 1, 5, "https://assets.zatiqeasy.com/inventories/19342569001060859.jpg", "[{\"id\":669,\"url\":\"https://assets.zatiqeasy.com/inventories/19342569001060859.jpg\",\"isPrimary\":true,\"productId\":669}]", 0, 0),
  (668, "Footrest (2-Rod Jali, After Market) For Yamaha FZS V2, FZS V3, FZS V4 & Fazer V2 bike.", "footrest-2-rod-jali-after-market-for-yamaha-fzs-v2-fzs-v3-fzs-v4-fazer-v2-bike-379334", "BM-1642-379334", "100% Genuine and authentic Footrest (2-Rod Jali, After Market) For Yamaha FZS V2, FZS V3, FZS V4 & Fazer V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 420, 600, 22, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/22704984432869577.jpg", "[{\"id\":668,\"url\":\"https://assets.zatiqeasy.com/inventories/22704984432869577.jpg\",\"isPrimary\":true,\"productId\":668}]", 0, 0),
  (667, "Silencer Rod Khacha SS (After Market) for FZS V2, FZS V3, Fazer V2 bike.", "silencer-rod-khacha-ss-after-market-for-fzs-v2-fzs-v3-fazer-v2-bike-399959", "BM-1641-399959", "100% Genuine and authentic Silencer Rod Khacha SS (After Market) for FZS V2, FZS V3, Fazer V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 800, 1000, 31, 9, 19, NULL, "https://assets.zatiqeasy.com/inventories/19161618783813435.jpg", "[{\"id\":667,\"url\":\"https://assets.zatiqeasy.com/inventories/19161618783813435.jpg\",\"isPrimary\":true,\"productId\":667}]", 0, 1),
  (666, "Carir (Red Color, After Market) for Yamaha MT15 bike.", "carir-red-color-after-market-for-yamaha-mt15-bike-369112", "BM-1640-369112", "100% Genuine and authentic Carir (Red Color, After Market) for Yamaha MT15 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 1500, 1650, 18, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/16921397825459681.jpg", "[{\"id\":666,\"url\":\"https://assets.zatiqeasy.com/inventories/16921397825459681.jpg\",\"isPrimary\":true,\"productId\":666}]", 0, 0),
  (665, "Saree Guard (After Market) for Yamaha bike.", "saree-guard-after-market-for-yamaha-bike-427490", "BM-1639-427490", "100% Genuine and authentic Saree Guard (After Market) for Yamaha bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 780, 1000, 30, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/20989037323274106.jpg", "[{\"id\":665,\"url\":\"https://assets.zatiqeasy.com/inventories/20989037323274106.jpg\",\"isPrimary\":true,\"productId\":665}]", 0, 0),
  (664, "Saree Guard (After Market) for Yamaha FZX bike.", "saree-guard-after-market-for-yamaha-fzx-bike-427495", "BM-1638-427495", "100% Genuine and authentic Saree Guard (After Market) for Yamaha FZX bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 2150, 2500, 10, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/20989278104573284.jpg", "[{\"id\":664,\"url\":\"https://assets.zatiqeasy.com/inventories/20989278104573284.jpg\",\"isPrimary\":true,\"productId\":664}]", 0, 0),
  (663, "Saree Guard (After Market) for Suzuki bike.", "saree-guard-after-market-for-suzuki-bike-427500", "BM-1637-427500", "100% Genuine and authentic Saree Guard (After Market) for Suzuki bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 785, 1000, 11, 9, 2, 6, "https://assets.zatiqeasy.com/inventories/20989483782804622.jpg", "[{\"id\":663,\"url\":\"https://assets.zatiqeasy.com/inventories/20989483782804622.jpg\",\"isPrimary\":true,\"productId\":663}]", 0, 1),
  (662, "Half Saree Guard (After Market) for Honda X-Blade bike.", "half-saree-guard-after-market-for-honda-x-blade-bike-432445", "BM-1636-432445", "100% Genuine and authentic Half Saree Guard (After Market) for Honda X-Blade bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 530, 700, 29, 9, 5, 10, "https://assets.zatiqeasy.com/inventories/21339305275114805.jpg", "[{\"id\":662,\"url\":\"https://assets.zatiqeasy.com/inventories/21339305275114805.jpg\",\"isPrimary\":true,\"productId\":662}]", 0, 0),
  (661, "Bag Hook (CNC-Spring-After Market) for Honda X Blade bike.", "bag-hook-cnc-spring-after-market-for-honda-x-blade-bike-432460", "BM-1635-432460", "100% Genuine and authentic Bag Hook (CNC-Spring-After Market) for Honda X Blade bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 350, 500, 11, 9, 5, 10, "https://assets.zatiqeasy.com/inventories/21338973913040670.jpg", "[{\"id\":661,\"url\":\"https://assets.zatiqeasy.com/inventories/21338973913040670.jpg\",\"isPrimary\":true,\"productId\":661}]", 0, 0),
  (660, "Saree Guard (After Market) for Hero Xtreme 125R bike.", "saree-guard-after-market-for-hero-xtreme-125r-bike-441159", "BM-1634-441159", "100% Genuine and authentic Saree Guard (After Market) for Hero Xtreme 125R bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 2150, 2500, 22, 9, 14, 11, "https://assets.zatiqeasy.com/inventories/21914483712685167.jpg", "[{\"id\":660,\"url\":\"https://assets.zatiqeasy.com/inventories/21914483712685167.jpg\",\"isPrimary\":true,\"productId\":660}]", 0, 0),
  (659, "Silencer Tara Cover (After Market) for Hero Xtreme 125R bike.", "silencer-tara-cover-after-market-for-hero-xtreme-125r-bike-441168", "BM-1633-441168", "100% Genuine and authentic Silencer Tara Cover (After Market) for Hero Xtreme 125R bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 740, 1000, 19, 9, 14, 11, "https://assets.zatiqeasy.com/inventories/21915015016301618.jpg", "[{\"id\":659,\"url\":\"https://assets.zatiqeasy.com/inventories/21915015016301618.jpg\",\"isPrimary\":true,\"productId\":659}]", 0, 1),
  (658, "Silencer Cover (After Market) for Yamaha FZX bike.", "silencer-cover-after-market-for-yamaha-fzx-bike-441184", "BM-1632-441184", "100% Genuine and authentic Silencer Cover (After Market) for Yamaha FZX bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 850, 1000, 20, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/21915885327758019.jpg", "[{\"id\":658,\"url\":\"https://assets.zatiqeasy.com/inventories/21915885327758019.jpg\",\"isPrimary\":true,\"productId\":658}]", 0, 0),
  (657, "Bag Hook (CNC-Spring-After Market) for Hero Thriller 160r bike.", "bag-hook-cnc-spring-after-market-for-hero-thriller-160r-bike-452209", "BM-1631-452209", "100% Genuine and authentic Bag Hook (CNC-Spring-After Market) for Hero Thriller 160r bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 350, 500, 33, 9, 14, 11, "https://assets.zatiqeasy.com/inventories/22709328279339960.jpg", "[{\"id\":657,\"url\":\"https://assets.zatiqeasy.com/inventories/22709328279339960.jpg\",\"isPrimary\":true,\"productId\":657}]", 0, 0),
  (656, "Bag Hook (CNC-Spring-After Market) for Hero Xtreme 125R bike.", "bag-hook-cnc-spring-after-market-for-hero-xtreme-125r-bike-452223", "BM-1630-452223", "100% Genuine and authentic Bag Hook (CNC-Spring-After Market) for Hero Xtreme 125R bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 350, 500, 26, 9, 14, 11, "https://assets.zatiqeasy.com/inventories/22704690378293031.jpg", "[{\"id\":656,\"url\":\"https://assets.zatiqeasy.com/inventories/22704690378293031.jpg\",\"isPrimary\":true,\"productId\":656}]", 0, 0),
  (655, "Bag Hook (Spring-After Market) for Yamaha FZS V2 Fazer V2 bike.", "bag-hook-spring-after-market-for-yamaha-fzs-v2-fazer-v2-bike-452250", "BM-1629-452250", "100% Genuine and authentic Bag Hook (Spring-After Market) for Yamaha FZS V2 Fazer V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 350, 500, 18, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/22706054673568547.jpg", "[{\"id\":655,\"url\":\"https://assets.zatiqeasy.com/inventories/22706054673568547.jpg\",\"isPrimary\":true,\"productId\":655}]", 0, 1),
  (654, "Cariel (After Market) for Yamaha FZX bike.", "cariel-after-market-for-yamaha-fzx-bike-473213", "BM-1628-473213", "100% Genuine and authentic Cariel (After Market) for Yamaha FZX bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 1650, 2050, 18, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/24182959496229294.jpg", "[{\"id\":654,\"url\":\"https://assets.zatiqeasy.com/inventories/24182959496229294.jpg\",\"isPrimary\":true,\"productId\":654}]", 0, 0),
  (653, "Half Saree Guard (After Market) for Yamaha bike.", "half-saree-guard-after-market-for-yamaha-bike-539225", "BM-1627-539225", "100% Genuine and authentic Half Saree Guard (After Market) for Yamaha bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 600, 700, 31, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/1939743226456674.jpg", "[{\"id\":653,\"url\":\"https://assets.zatiqeasy.com/inventories/1939743226456674.jpg\",\"isPrimary\":true,\"productId\":653}]", 0, 0),
  (652, "Bag Hook (CNC-Spring-After Market) for Honda Hornet V2 bike.", "bag-hook-cnc-spring-after-market-for-honda-hornet-v2-bike-432454", "BM-1626-432454", "100% Genuine and authentic Bag Hook (CNC-Spring-After Market) for Honda Hornet V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 350, 500, 29, 9, 5, 10, "https://assets.zatiqeasy.com/inventories/21339151171641808.jpg", "[{\"id\":652,\"url\":\"https://assets.zatiqeasy.com/inventories/21339151171641808.jpg\",\"isPrimary\":true,\"productId\":652}]", 0, 0),
  (651, "Double Stan (After Market) for Yamaha FZ25 bike.", "double-stan-after-market-for-yamaha-fz25-bike-647432", "BM-1625-647432", "100% Genuine and authentic Double Stan (After Market) for Yamaha FZ25 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 1980, 2500, 30, 9, 1, 5, "https://assets.zatiqeasy.com/easy/uploads/50136/inventories/c0/da/double-stan-after-market-for-yamaha-fz25-bike-467408054991367/original.png", "[{\"id\":651,\"url\":\"https://assets.zatiqeasy.com/easy/uploads/50136/inventories/c0/da/double-stan-after-market-for-yamaha-fz25-bike-467408054991367/original.png\",\"isPrimary\":true,\"productId\":651}]", 0, 1),
  (650, "Leg Gard-Bumper (After Market) for Yamaha FZ25 bike.", "leg-gard-bumper-after-market-for-yamaha-fz25-bike-647446", "BM-1624-647446", "100% Genuine and authentic Leg Gard-Bumper (After Market) for Yamaha FZ25 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 4600, 5500, 32, 9, 1, 5, "https://assets.zatiqeasy.com/easy/uploads/50136/inventories/db/26/leg-gard-bumper-after-market-for-yamaha-fz25-bike-9099342110322534/original.jpg", "[{\"id\":650,\"url\":\"https://assets.zatiqeasy.com/easy/uploads/50136/inventories/db/26/leg-gard-bumper-after-market-for-yamaha-fz25-bike-9099342110322534/original.jpg\",\"isPrimary\":true,\"productId\":650}]", 0, 0),
  (649, "Silencer Gard (After Market) for Yamaha FZ25 bike.", "silencer-gard-after-market-for-yamaha-fz25-bike-647450", "BM-1623-647450", "100% Genuine and authentic Silencer Gard (After Market) for Yamaha FZ25 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 1450, 2000, 19, 9, 1, 5, "https://assets.zatiqeasy.com/easy/uploads/50136/inventories/62/46/silencer-gard-after-market-for-yamaha-fz25-bike-11080039983771696/original.jpg", "[{\"id\":649,\"url\":\"https://assets.zatiqeasy.com/easy/uploads/50136/inventories/62/46/silencer-gard-after-market-for-yamaha-fz25-bike-11080039983771696/original.jpg\",\"isPrimary\":true,\"productId\":649}]", 0, 0),
  (648, "Double Stand (After Market) for Yamaha R15 V3, R15 V4,  R15M, MT15 V1 & MT15 V2.", "double-stand-after-market-for-yamaha-r15-v3-r15-v4-r15m-mt15-v1-mt15-v2-824847", "BM-1622-824847", "100% Genuine and authentic Double Stand (After Market) for Yamaha R15 V3, R15 V4,  R15M, MT15 V1 & MT15 V2.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 1680, 2400, 11, 9, 1, 5, "https://assets.zatiqeasy.com/inventories/2306556366697854.jpg", "[{\"id\":648,\"url\":\"https://assets.zatiqeasy.com/inventories/2306556366697854.jpg\",\"isPrimary\":true,\"productId\":648}]", 0, 0),
  (647, "Saree Guard (After Market) Honda Hornet V2 bike.", "saree-guard-after-market-honda-hornet-v2-bike-432440", "BM-1621-432440", "100% Genuine and authentic Saree Guard (After Market) Honda Hornet V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 790, 1000, 25, 9, 5, 10, "https://assets.zatiqeasy.com/inventories/21339430326096919.jpg", "[{\"id\":647,\"url\":\"https://assets.zatiqeasy.com/inventories/21339430326096919.jpg\",\"isPrimary\":true,\"productId\":647}]", 0, 1),
  (646, "Silencer Tara Cover (After Market) for Honda Hornet V2 bike.", "silencer-tara-cover-after-market-for-honda-hornet-v2-bike-432448", "BM-1620-432448", "100% Genuine and authentic Silencer Tara Cover (After Market) for Honda Hornet V2 bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 740, 1000, 20, 9, 5, 10, "https://assets.zatiqeasy.com/inventories/21338532132000488.jpg", "[{\"id\":646,\"url\":\"https://assets.zatiqeasy.com/inventories/21338532132000488.jpg\",\"isPrimary\":true,\"productId\":646}]", 0, 0),
  (645, "Visor (After Market) for Hero Xtreme 125R bike.", "visor-after-market-for-hero-xtreme-125r-bike-773089", "BM-1619-773089", "100% Genuine and authentic Visor (After Market) for Hero Xtreme 125R bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 780, 1100, 30, 9, 14, 11, "https://assets.zatiqeasy.com/inventories/610338497400936.jpg", "[{\"id\":645,\"url\":\"https://assets.zatiqeasy.com/inventories/610338497400936.jpg\",\"isPrimary\":true,\"productId\":645}]", 0, 0),
  (644, "Engine Guard for Yamaha FZS V2 Matalick Black bike.", "engine-guard-for-yamaha-fzs-v2-matalick-black-bike-295024", "BM-1618-295024", "100% Genuine and authentic Engine Guard for Yamaha FZS V2 Matalick Black bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 3050, 3600, 30, 1, 1, 5, "https://assets.zatiqeasy.com/easy/uploads/50136/inventories/engine-guard-yamaha-fzs-v2-matalick-black-bike-1612842783990707.jpg", "[{\"id\":644,\"url\":\"https://assets.zatiqeasy.com/easy/uploads/50136/inventories/engine-guard-yamaha-fzs-v2-matalick-black-bike-1612842783990707.jpg\",\"isPrimary\":true,\"productId\":644}]", 0, 0),
  (643, "Engine guard for Yamaha FZS V2 Dark Night new model bike.", "engine-guard-for-yamaha-fzs-v2-dark-night-new-model-bike-295019", "BM-1617-295019", "100% Genuine and authentic Engine guard for Yamaha FZS V2 Dark Night new model bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 3680, NULL, 18, 1, 1, 5, "https://assets.zatiqeasy.com/inventories/101419483215017.jpg", "[{\"id\":643,\"url\":\"https://assets.zatiqeasy.com/inventories/101419483215017.jpg\",\"isPrimary\":true,\"productId\":643}]", 0, 1),
  (642, "Engine Guard for Yamaha FZS V2 Armada Blue bike.", "engine-guard-for-yamaha-fzs-v2-armada-blue-bike-295031", "BM-1616-295031", "100% Genuine and authentic Engine Guard for Yamaha FZS V2 Armada Blue bike.. Engineered specifically for motorcycle performance, durability, and reliability. Sourced directly with original manufacturer guarantee. Available for fast Cash on Delivery all across Bangladesh and instant WhatsApp ordering with Bismillah Motors.", 3480, 4300, 31, 16, 1, 5, "https://assets.zatiqeasy.com/inventories/4122584712250523.jpg", "[{\"id\":642,\"url\":\"https://assets.zatiqeasy.com/inventories/4122584712250523.jpg\",\"isPrimary\":true,\"productId\":642}]", 0, 0)
ON DUPLICATE KEY UPDATE name=VALUES(name);
