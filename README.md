# Bismillah Motors — cPanel Deployment Guide (React + PHP/MySQL)

Production-ready full-stack e-commerce deployment package for Bismillah Motors (Motorcycle parts & stickers in Jashore, Bangladesh).

---

## Architecture Overview
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS (SPA).
- **Backend:** Pure PHP 7.4 / 8.x with PDO and MySQL/MariaDB (zero Node.js or Composer required on the server).
- **Authentication:** Stateless HMAC-SHA256 tokens for admin sessions + Firebase Google Sign-In support.
- **Hosting Target:** Standard cPanel shared hosting (Hostinger, Namecheap, Bluehost, cPanel File Manager).

---

## Step 1: Download the cPanel Deployment ZIP
1. Open your GitHub repository in your browser.
2. Go to the **Actions** tab at the top.
3. Click the latest successful run of **"Build & Package Static Site for cPanel"**.
4. Scroll down to the bottom under **Artifacts** and click **`bismillah-motors-cpanel`** to download `bismillah-motors-cpanel.zip`.
5. Extract the ZIP on your computer. You will see the `bismillah-motors-cpanel/` folder.

---

## Step 2: Create MySQL Database in cPanel
1. Log into your **cPanel** dashboard.
2. Go to **Databases** -> **MySQL Databases**.
3. Create a new database (e.g. `yourcpaneluser_bismillah`).
4. Under **MySQL Users**, create a new user (e.g. `yourcpaneluser_bismillah_user`) with a strong password. Note down the password!
5. Under **Add User To Database**, select the user and database, and click **Add**.
6. Check **ALL PRIVILEGES** and click **Make Changes**.

---

## Step 3: Import Schema & Seed Data via phpMyAdmin
1. In cPanel, open **phpMyAdmin**.
2. Click on your newly created database on the left sidebar.
3. Click the **Import** tab at the top menu.
4. Click **Choose File** and select `schema.sql` from your extracted deployment folder.
5. Click **Go** (or **Import**) at the bottom.
6. You should see a green success message: *"Import has been successfully finished"*.

---

## Step 4: Configure Database Credentials in `api/config.php`
Open `api/config.php` in any text editor and fill in your details:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'yourcpaneluser_bismillah');
define('DB_USER', 'yourcpaneluser_bismillah_user');
define('DB_PASS', 'your-strong-password-here');

// Generate a random string or keep the secure default
define('JWT_SECRET', 'b1sm1ll4h_m0t0rs_s3cur3_jwt_t0k3n_k3y_j4sh0r3_bd_2026_xyz987');

// Primary administrator email (for Google Admin Login)
define('ADMIN_EMAIL', 'gmsgroupofindustries@gmail.com');

// Store contact for WhatsApp checkout
define('STORE_PHONE', '8801974060224');
```

Save the file.

---

## Step 5: Upload Files to `public_html/`
1. In cPanel, open **File Manager** and enter the **`public_html`** folder.
2. Click the gear icon (**Settings**) in the top right corner and ensure **"Show Hidden Files (dotfiles)"** is checked.
3. Upload everything inside `bismillah-motors-cpanel/` into `public_html/`:
   ```
   public_html/
   ├── .htaccess             <-- CRITICAL (handles SPA & /api/ routing)
   ├── index.html
   ├── logo.jpg
   ├── assets/
   ├── data/
   ├── schema.sql
   └── api/                  <-- Contains index.php, config.php, routes/
   ```
4. Confirm `api/config.php` contains your database password.

---

## Step 6: Test Your Store
1. Open your domain in your browser: `https://yourdomain.com/`
2. Test the API directly in your browser: `https://yourdomain.com/api/products?limit=5`
   - You should receive clean JSON data from MySQL!
3. Browse products, add to cart, and place a test order with Cash on Delivery or WhatsApp.
4. Click **Admin Portal** in the top navigation to log in.

---

## Default Admin Credentials
- **Email:** `admin@bismillahmotorsbd.com`
- **Password:** `admin123`
*(Or click **"One-Click Login with Google (Owner)"** using `gmsgroupofindustries@gmail.com`)*

**To change the admin password:**
In phpMyAdmin, run this SQL command:
```sql
UPDATE admins 
SET password_hash = '$2y$10$8QaZvG78Gn7BhrBuW/J2TeEU07OQs1PHqijahgZANI4sCM0QnhQOS' 
WHERE email = 'admin@bismillahmotorsbd.com';
```

---

## Troubleshooting Checklist
- **404 on page reload (`/products`, `/cart`):** Check that `.htaccess` was uploaded to `public_html/`. Because `.htaccess` starts with a dot, make sure "Show Hidden Files" is enabled in cPanel File Manager.
- **500 Database Error on `/api/*`:** Double-check `api/config.php` — make sure `DB_NAME`, `DB_USER`, and `DB_PASS` match your cPanel MySQL user credentials exactly.
- **WhatsApp Checkout:** When a customer clicks "Order via WhatsApp", it automatically opens WhatsApp with a prefilled Bangladeshi order invoice directing to `+8801974060224`.
