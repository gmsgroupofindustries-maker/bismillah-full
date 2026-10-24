# Static cPanel (Apache) Deployment & Firebase Optimization

Prepare the Bismillah Motors React + Vite storefront for static hosting on cPanel (Apache) under `public_html` via direct ZIP upload, ensuring flawless client-side routing, manual Firebase configuration, and offline-resilient product catalog fallbacks.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Deployment Configuration:**
> - **Domain Target:** Root domain or subdomain in `public_html` (using `base: '/'`).
> - **Deployment Method:** Uploading a ZIP file directly to cPanel File Manager and extracting into `public_html`.
> - **Apache Routing:** Client-side SPA routing managed via a dedicated `.htaccess` placed directly in the `public/` directory (so it bundles into `dist/` automatically on build).
> - **Firebase Keys:** A dedicated `src/lib/firebaseConfig.ts` with readable placeholders for manual copy-pasting of Firebase credentials, with automatic fallback to environment variables and existing applet config.
> - **Static API Resilience:** If deployed without a Node backend on cPanel, the frontend will automatically failover to a bundled product catalog (all 681 genuine motorcycle products) and direct client-side WhatsApp/Firestore order placement, preventing broken API errors.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the full-stack repository into a static-ready build artifact that can be deployed onto traditional cPanel shared hosting (Apache web server) without requiring an active Node.js daemon.
- **Target Audience**: Store owner (`gmsgroupofindustries@gmail.com`) deploying the website to cPanel shared hosting via ZIP upload.
- **Key Value**: Zero-configuration static hosting on Apache, no "404 Page Not Found" errors on page refresh, and a dedicated, isolated file for entering Firebase credentials.

---

## 2. User Experience & Deployment Flow

- **Deployment Flow for Store Owner**:
  1. Build the static site (`npm run build` or `bun run build`).
  2. Zip the generated `dist/` directory (which will contain `index.html`, `assets/`, and `.htaccess`).
  3. Upload the ZIP into cPanel `public_html` and click **Extract**.
  4. Paste Firebase keys into `src/lib/firebaseConfig.ts` whenever connecting a new Firebase project.
- **Visitor Experience**:
  - Instant page loads with client-side SPA routing (`/products`, `/category/engine-parts`, `/cart`, `/checkout`, `/admin`).
  - Refreshing or directly typing any deep URL loads the proper view without Apache 404 errors.
  - Full product browsing, search, brand filters, and instant WhatsApp / Cash on Delivery ordering.

---

## 3. Key Product Decisions & Architecture

- **Decision 1: Vite Base Path Configuration**
  - *Chosen Approach*: Set `base: '/'` in `vite.config.ts`.
  - *Why*: The site is published at the root domain / subdomain in `public_html`. Absolute root paths ensure asset links (`/assets/index-xxx.js`, `/assets/index-xxx.css`) and SPA routing resolve accurately regardless of URL depth.
- **Decision 2: Dedicated `firebaseConfig.ts` with Manual Paste Support**
  - *Chosen Approach*: Create `src/lib/firebaseConfig.ts` exposing `manualFirebaseConfig` with clear instructions and editable strings, while keeping dynamic fallbacks.
  - *Why*: Allows the owner to paste keys without needing to manage `.env` files on static cPanel hosting.
- **Decision 3: Apache `.htaccess` in `public/` Directory**
  - *Chosen Approach*: Store `.htaccess` inside `public/.htaccess`.
  - *Why*: Vite copies all files in `public/` straight to the root of `dist/` during build. When the user zips and uploads `dist/`, `.htaccess` is already in place.
- **Decision 4: Static Catalog & Order Fallback (`api.ts`)**
  - *Chosen Approach*: If `/api/*` is unreachable (standard for static Apache cPanel without Node.js), `api.ts` gracefully serves the pre-bundled product catalog and handles checkout via WhatsApp and Firestore.
  - *Why*: Prevents `SyntaxError: Unexpected token '<'` when static Apache serves `index.html` for missing `/api` endpoints.

---

## 4. Technical Architecture & Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    cPanel (Apache Server)                   │
│                       public_html/                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                     .htaccess                       │   │
│   │  - RewriteEngine On                                 │   │
│   │  - RewriteCond %{REQUEST_FILENAME} !-f              │   │
│   │  - RewriteRule . /index.html [L]                    │   │
│   │  - Gzip / Brotli Compression & Security Headers     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   dist/index.html                   │   │
│   │           (Single Page Application Entry)           │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│   src/lib/firebase.ts   │           │     src/lib/api.ts      │
│            ▲            │           │  (Dual-Mode Data Layer) │
│            │            │           └────────────┬────────────┘
│ ┌─────────────────────┐ │                        │
│ │ src/lib/            │ │           ┌────────────┴────────────┐
│ │ firebaseConfig.ts   │ │           ▼                         ▼
│ │ (Manual Keys Paste) │ │   ┌──────────────┐          ┌──────────────┐
│ └─────────────────────┘ │   │ Node Backend │ (or)     │ Client-Side  │
└─────────────────────────┘   │  /api routes │          │ Static Data  │
                              └──────────────┘          │  & Firestore │
                                                        └──────────────┘
```

---

## 5. Implementation Steps

1. **Create `src/lib/firebaseConfig.ts`**:
   - Provide clean, commented placeholder fields for `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
   - Implement smart fallback prioritizing:
     1. Non-placeholder manual values in `firebaseConfig.ts`.
     2. Client environment variables (`import.meta.env.VITE_FIREBASE_*`).
     3. Existing `firebase-applet-config.json`.
   - Update `src/lib/firebase.ts` to import from `./firebaseConfig.ts`.

2. **Configure `vite.config.ts`**:
   - Explicitly define `base: '/'` suitable for root domain deployment.
   - Configure clean static build outputs (`outDir: 'dist'`).

3. **Create `public/.htaccess`**:
   - Enable `mod_rewrite` with SPA fallback to `/index.html`.
   - Enable Gzip / Deflate compression for text, css, javascript, and json.
   - Set browser caching headers for static assets (`/assets/*`).
   - Add MIME types for `.webp`, `.json`, `.js`, and `.css`.

4. **Enhance Client-Side Static Resilience in `src/lib/api.ts`**:
   - Add graceful fallback handling when `/api` returns 404 or HTML (pure static Apache), serving local product data with full search, category, brand, and pagination support.
   - Ensure checkout and WhatsApp ordering work seamlessly on static cPanel.

5. **Build & Verify**:
   - Run `npm run build` to confirm `dist/` contains `index.html`, `assets/`, and `.htaccess`.
   - Validate with `lint_applet` and `compile_applet`.
