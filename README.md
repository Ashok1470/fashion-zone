# Fashion Zone — React E-commerce Demo

A complete React + Vite frontend for:

**FASHION ZONE — The Multi Brand Store**

Business details from the visiting card:
- Instagram: @itfashionzone
- WhatsApp: 8919321569
- Address: Near Parvathanamma Temple, Gantapalem, ONGOLE - 523 001
- Mens Wear | Sports Wear | Accessories
- Branded Shirts | Jeans Pants | Formal Trousers | T-Shirts | Track Pants | Shorts | Belts | Wallets | Inner Wears

## Features

- Login and Register
- One mobile number can register once
- Wrong mobile number / wrong password messages
- Login required before shopping
- Product search, categories and sorting
- Product details
- Cart
- Checkout and customer delivery details
- Cash on Delivery
- Order confirmation and My Orders
- WhatsApp customer support
- Instagram link
- Customer profile
- Admin dashboard
- Add / edit / delete products
- Manage stock
- View customers
- Update order status
- Responsive Myntra/Flipkart-inspired shopping experience
- Animations and toast notifications
- localStorage persistence

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Demo admin

Mobile: `8919321569`
Password: `8919321569`

## Important production note

This version is intentionally frontend-only so it can run immediately without a paid backend.

It stores users, sessions, products and orders in browser localStorage. This fixed build includes a starter product catalog and falls back to it whenever the browser has no saved products, so the public mobile site will not show an empty product section on a fresh device. Passwords are therefore NOT safe for a real production store.

For a real public e-commerce website, replace the localStorage authentication with a backend such as Node.js/Express + MongoDB/Firebase Authentication, hash passwords, validate sessions server-side, and protect admin APIs.


## Admin-only website settings

The Admin dashboard includes **Site Settings**, where the admin can:
- Change the website logo (header, login page and footer)
- Restore the default Fashion Zone logo
- Change the customer WhatsApp support number
- Change the WhatsApp welcome message
- Manage products, stock, orders and view customers

Logo and settings are persisted in localStorage in this frontend-only version. For a real multi-device store, move admin authentication, products, orders, images and settings to a secure backend/database.


## Mobile product fix

The previous build had `SEED_PRODUCTS = []`. Because products were stored only in browser localStorage, a phone/browser with no saved catalog showed "No products available yet" even though products had been added on another device.

This build:
- includes 12 starter products;
- uses the starter catalog whenever `fz_products_v2` is missing or empty;
- keeps any existing non-empty catalog in localStorage;
- keeps the existing responsive two-column mobile product grid.

Important: localStorage is device/browser-specific. If the owner adds or edits products in Admin on a desktop, those changes are not automatically synchronized to customers' phones. A shared backend/database is required for that.


## Product catalog behavior
- No AI, starter, or demo products are included.
- Customers see only products that the admin has added.
- Legacy products whose IDs start with `seed_` are automatically ignored.
- The current frontend stores the catalog in browser localStorage; a shared database is required for admin-added products to appear across different customer devices.
