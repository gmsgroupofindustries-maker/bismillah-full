const fs = require('fs');

const products = JSON.parse(fs.readFileSync('public/data/products.json', 'utf8')).slice(0, 40);
const categories = JSON.parse(fs.readFileSync('public/data/categories.json', 'utf8'));
const brands = JSON.parse(fs.readFileSync('public/data/brands.json', 'utf8'));
const bikeBrands = JSON.parse(fs.readFileSync('public/data/bike-brands.json', 'utf8'));

let sql = `-- ==========================================================
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
`;

sql += categories.map((c, i) => `  (${c.id}, ${JSON.stringify(c.name)}, ${JSON.stringify(c.slug)}, ${JSON.stringify(c.imageUrl || '')}, ${i + 1})`).join(',\n');
sql += '\nON DUPLICATE KEY UPDATE name=VALUES(name);\n\n';

sql += `-- ----------------------------------------------------------
-- SEED DATA: Brands
-- ----------------------------------------------------------
INSERT INTO brands (id, name, slug, logo, sort_order) VALUES
`;
sql += brands.map((b, i) => `  (${b.id}, ${JSON.stringify(b.name)}, ${JSON.stringify(b.slug)}, ${JSON.stringify(b.logoUrl || '')}, ${i + 1})`).join(',\n');
sql += '\nON DUPLICATE KEY UPDATE name=VALUES(name);\n\n';

sql += `-- ----------------------------------------------------------
-- SEED DATA: Bike Brands
-- ----------------------------------------------------------
INSERT INTO bike_brands (id, name, slug, sort_order) VALUES
`;
sql += bikeBrands.map((bb, i) => `  (${bb.id}, ${JSON.stringify(bb.name)}, ${JSON.stringify(bb.slug)}, ${i + 1})`).join(',\n');
sql += '\nON DUPLICATE KEY UPDATE name=VALUES(name);\n\n';

sql += `-- ----------------------------------------------------------
-- SEED DATA: Sample Products (30 Initial Products)
-- ----------------------------------------------------------
INSERT INTO products (id, name, slug, sku, description, price, discount_price, stock, category_id, brand_id, bike_brand_id, image, images, is_featured, is_popular) VALUES
`;
const prodRows = products.map(p => {
  const imgUrl = (p.images && p.images[0]) ? p.images[0].url : (p.imageUrl || '');
  const imagesJson = JSON.stringify(p.images || []);
  return `  (${p.id}, ${JSON.stringify(p.name)}, ${JSON.stringify(p.slug)}, ${JSON.stringify(p.sku)}, ${JSON.stringify(p.description || '')}, ${p.price}, ${p.discountPrice || 'NULL'}, ${p.stock || 15}, ${p.categoryId || 'NULL'}, ${p.brandId || 'NULL'}, ${p.bikeBrandId || 'NULL'}, ${JSON.stringify(imgUrl)}, ${JSON.stringify(imagesJson)}, ${p.isFeatured ? 1 : 0}, ${p.isPopular ? 1 : 0})`;
});
sql += prodRows.join(',\n');
sql += '\nON DUPLICATE KEY UPDATE name=VALUES(name);\n';

fs.writeFileSync('backend/schema.sql', sql);
console.log('✅ Generated backend/schema.sql successfully!');
