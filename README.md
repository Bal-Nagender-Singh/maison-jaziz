# Masion Jaziz

A luxury fragrance storefront with React, Tailwind CSS, Express, Prisma, PostgreSQL, email OTP authentication, Cloudinary product images, and Razorpay / COD Checkout.

## Requirements

- Node.js 20+
- PostgreSQL 14+
- Cloudinary account
- Razorpay test-mode account (for card/online payments)
- Gmail account with 2-Step Verification and an app password (for email OTPs)

## Local setup

1. Install dependencies:

   ```powershell
   npm.cmd install
   npm.cmd run install:all
   ```

2. Copy environment templates:

   ```powershell
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env
   ```

3. Create PostgreSQL database `masion_jaziz`, then set a standard connection string in `server/.env`:

   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/masion_jaziz?schema=public
   ```

   No Neon-specific variable or driver is used. Any PostgreSQL provider works with a normal `DATABASE_URL`.

4. Generate the Prisma client, apply committed migrations, and seed products/admin:

   ```powershell
   npm.cmd run db:generate --prefix server
   npm.cmd run db:deploy --prefix server
   npm.cmd run seed
   ```

   `ADMIN_EMAIL` defaults to `admin@masionjaziz.com`. The seed upserts that email with the `admin` role. Set `ADMIN_PASSWORD` and sign in at `/admin/login` or via the Admin login interface; admin accounts cannot use OTP. Customer accounts use email OTP. To promote an existing user manually:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
   ```

5. Start API and storefront:

   ```powershell
   npm.cmd run dev
   ```

   Storefront: `http://localhost:5173`  
   API health: `http://localhost:5000/api/health`

For a new development migration after editing `schema.prisma`, run `npm.cmd run db:migrate --prefix server`. Production deployments should only run `db:deploy`.

## Environment variables

Server variables are documented in `server/.env.example`. Use a random value of at least 32 characters for `JWT_SECRET`. Keep every secret server-side; the API returns only Razorpay's public key ID to Checkout. `CLIENT_URL` accepts a comma-separated allowlist when multiple exact CORS origins are needed.

The browser only needs:

```env
VITE_API_URL=http://localhost:5000/api
```

Authentication uses a seven-day HTTP-only cookie. Production cookies require HTTPS and use `Secure; SameSite=None` for a separately hosted API and client.

## Cloudinary

Create an API key in Cloudinary and set:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Admin uploads go through `POST /api/uploads/product-image`; the API accepts JPEG, PNG, WebP, or AVIF up to 8 MB and uploads into `masion-jaziz/products`. PostgreSQL stores only `image_url` and `image_public_id` on the product, and details for extra gallery images in `ProductImage`. Replacing or deleting a product attempts to destroy its prior Cloudinary asset. If Cloudinary is configured during seeding, editorial seed sources are imported into Cloudinary; otherwise products are seeded without a managed image and can be populated from the admin dashboard.

## Razorpay & Checkout

Copy test credentials from Razorpay Dashboard → Account & Settings → API Keys:

```env
RAZORPAY_KEY_ID=rzp_test_...
```

For online payment checkouts, the API recalculates prices and stock, creates an INR Razorpay order, and returns the order plus public key ID. After Checkout, the API verifies the HMAC signature and Razorpay payment details, revalidates price/stock, then atomically writes the order, items, shipping details, and stock change. It is idempotent on `razorpay_order_id`. Use a payment method listed by Razorpay for test mode; no real money is charged with `rzp_test_` credentials.

Alternatively, Cash on Delivery (COD) checkouts are supported via the COD endpoint, bypassing payment gateway requirements and setting the order payment status to `pending` until delivery.

## Gmail OTP email

1. Enable 2-Step Verification on the Gmail account.
2. Create an app password in Google Account → Security → App passwords.
3. Set the following; paste the 16-character app password without spaces:

   ```env
   SMTP_EMAIL=your-account@gmail.com
   SMTP_APP_PASSWORD=your_app_password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```

Only the newest OTP is valid. OTPs are HMAC-SHA256 hashed, expire in ten minutes, become invalid after use, and both request/verification endpoints are rate-limited.

## Core Features

- **Storefront & Catalog**: Dynamic collection pages, featured/most-selling fragrance lists, ingredient details, and interactive brand storytelling.
- **Advanced Product Catalog**: Supports multi-size pricing/stock options (`ProductSize`) and a gallery of multiple product images (`ProductImage`).
- **Wishlist**: Registered users can save fragrances to their wishlist and manage them dynamically.
- **Faq & Settings Management**: Dynamic FAQ section and customizable store settings managed by admins via the admin portal.
- **Coupons**: Advanced eligibility checks (minimum order amounts, discount caps, usage limits, expiration checks, and customer-specific limits).

## API routes

- **Auth**:
  - `POST /api/auth/request-otp` - Request OTP code
  - `POST /api/auth/verify-otp` - Verify code and log in
  - `POST /api/auth/admin-login` - Admin password login
  - `GET /api/auth/me` - Get current session
  - `POST /api/auth/logout` - Clear session cookies
  - `PUT /api/auth/profile` - Update customer details (name, phone, address, etc.)
  - Admin `GET /api/auth/admin/users` - View registered users
- **Products**:
  - `GET /api/products` - List all products
  - `GET /api/products/:id` - Fetch single product (including gallery and sizes)
  - Admin `POST /api/products/admin` - Create new product
  - Admin `PUT /api/products/admin/:id` - Update product details
  - Admin `DELETE /api/products/admin/:id` - Delete product
  - Admin `POST /api/products/admin/:id/images` - Upload and add product gallery image
  - Admin `DELETE /api/products/admin/:id/images/:imageId` - Delete product gallery image
- **Catalog, FAQ & Settings**:
  - Public `GET /api/catalog/categories` - List categories
  - Public `GET /api/catalog/slides` - List hero slider slides
  - Public `GET /api/catalog/settings` - Retrieve general store settings
  - Public `GET /api/catalog/faqs` - List FAQs
  - Public `POST /api/catalog/coupons/validate` - Validate coupon code
  - Admin `/api/catalog/admin/categories` - Category CRUD
  - Admin `/api/catalog/admin/slides` - Hero slide CRUD
  - Admin `/api/catalog/admin/coupons` - Coupon CRUD
  - Admin `/api/catalog/admin/faqs` - FAQ CRUD
  - Admin `PUT /api/catalog/admin/settings` - Update store settings
- **Wishlist**:
  - `GET /api/wishlist` - Fetch user's wishlist
  - `POST /api/wishlist` - Add product to wishlist (body: `{ productId }`)
  - `DELETE /api/wishlist/:productId` - Remove product from wishlist
- **Upload**:
  - Admin `POST /api/uploads/product-image` - File upload to Cloudinary (`multipart/form-data`, field: `image`)
- **Payments**:
  - `POST /api/payments/create-razorpay-order` - Create order on Razorpay
  - `POST /api/payments/verify-razorpay-payment` - Verify payment and create local order
  - `POST /api/payments/create-cod-order` - Checkout using Cash on Delivery
- **Orders**:
  - `GET /api/orders/my-orders` - Fetch authenticated user's order history
  - Admin `GET /api/orders/admin` - View all customer orders
  - Admin `PUT /api/orders/admin/:id/status` - Update order shipment status

## End-to-end test checklist

1. Open Login / Account, enter an email, and confirm a six-digit message arrives.
2. Enter the newest code within ten minutes; confirm Account shows the email. Reusing the code must fail.
3. For the seeded admin email, open Admin, upload an image, and save a new or edited product. Confirm Cloudinary and the catalog both show it.
4. Add a product to the bag and open Checkout. A signed-out visitor is redirected to login and returned to Checkout afterward.
5. Complete shipping details and choose either **Pay securely with Razorpay** or **Cash on Delivery**.
6. If using Razorpay, enter test-mode payment credentials.
7. After checkout completion, confirm the success screen, Account order history, and Admin orders view show the new order.
8. Verify wishlist addition and removal on the catalog/product details page.
9. Edit the product with replacement images or delete it; confirm the old Cloudinary asset is removed.

## Verification commands

```powershell
npm.cmd run build
npm.cmd run check --prefix server
npx.cmd prisma validate --schema server/prisma/schema.prisma
```

The API cannot complete its startup connection check until `DATABASE_URL` points to a running PostgreSQL instance. Never commit `server/.env` or `client/.env`.

