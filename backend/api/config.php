<?php
// ======================================================================
// BISMILLAH MOTORS - CPANEL DATABASE & APPLICATION CONFIGURATION
// ======================================================================
// Instructions for cPanel:
// 1. Go to cPanel -> MySQL Databases -> Create a database and database user.
// 2. Grant ALL PRIVILEGES to the user for that database.
// 3. Edit the 4 constants below (DB_HOST, DB_NAME, DB_USER, DB_PASS).
// ======================================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'yourcpaneluser_bismillah');
define('DB_USER', 'yourcpaneluser_bismillah_user');
define('DB_PASS', 'your-strong-password-here');
define('DB_PORT', '3306');
define('DB_CHARSET', 'utf8mb4');

// Secret key for signing admin JWT tokens.
// Generate a 64-character random string or visit https://www.random.org/strings/
define('JWT_SECRET', 'b1sm1ll4h_m0t0rs_s3cur3_jwt_t0k3n_k3y_j4sh0r3_bd_2026_xyz987');

// Primary administrator email (authorized for One-Click Google Admin login)
define('ADMIN_EMAIL', 'gmsgroupofindustries@gmail.com');

// Store contact details (used by WhatsApp checkout URL generator)
define('STORE_PHONE', '8801974060224');
define('STORE_NAME', 'Bismillah Motors');
define('STORE_ADDRESS', 'Jashore Sadar, 7400, Bangladesh');
