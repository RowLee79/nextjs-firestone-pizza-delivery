# Firestone — Online Pizza Delivery System

A working Next.js App Router / React / TypeScript pizza ordering project with persistent orders, a customer menu and a staff fulfillment dashboard. This distribution uses Vinext (a Next.js API-compatible Cloudflare runtime), Cloudflare D1 SQLite and Drizzle migrations. Prices are in Philippine pesos and timestamps display in Manila time.

## Included features

- Searchable menu, Pizza/Sides/Drinks filters and availability controls.
- Regular/Large/Party pizzas, Classic/Thin/Stuffed cheese crusts, four optional toppings and quantity selection.
- Cart with quantity updates, item removal, minimum subtotal and delivery fees by zone.
- Delivery checkout: name, email, phone, street address, zone and instructions.
- Cash-on-delivery demo orders; server recalculates prices from the menu rather than trusting client totals.
- Retry idempotency within a checkout attempt prevents duplicate submissions with the same request key.
- Reference/email order tracking, manual progress timeline, receipt printing and pre-acceptance cancellation.
- Staff queue: accept, prepare, assign a rider, dispatch, deliver and record cash received.
- Staff menu creation/editing/availability, order history, report counts and CSV export.
- Persistent price/name/customization snapshots preserve existing orders after menu changes.
- Responsive design, original illustrative pizza photograph and explicit loading/error/empty states.
- Sample menu: six pizzas, two sides and two drinks.

## Requirements

Node.js 22.13+ and npm. Initial dependency installation requires internet access. Use package-lock.json. A current Node installation on Windows, macOS or Linux can run the local application.

## Local setup

1. Extract the ZIP. Open a terminal in the `firestone-pizza` folder containing package.json.
2. Install dependencies:

   `npm ci`

3. Build:

   `npm run build`

4. Create the local database schema (once per fresh local database):

   `npx wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_swift_toad_men.sql`

5. Run:

   `npm start`

6. Open the printed localhost URL, normally http://127.0.0.1:8787.
7. Click **Load sample menu**. Add a pizza, customize it and complete checkout with fictional contact/address details.
8. Copy the order reference. Track order can retrieve it using the reference plus contact email.
9. Open Staff dashboard to manage fulfillment. Assign a rider before dispatching. After delivery, select **Record cash received**.

For hot reload use `npm run dev` after schema setup. Vite/Cloudflare local state is under `.wrangler/state`; if the dev runtime selects another persistence location, initialize that local DB with the SQL and matching binding/config/path. The build/start sequence above uses an explicit persistence path. Local data and dependencies are excluded from Git.

## Validation commands

`npx tsc --noEmit`

`node tests/workflows.mjs`

`npm run build`

The API workflow test runs the actual route implementation with a transactional in-memory SQLite adapter. It checks pricing, fees, idempotency, tracking, input ranges, fulfillment transitions, rider assignment, payment/cancellation rules, unavailable items and historical snapshots. It does not touch your running database. Browser interaction tests are not included.

## Ordering rules

- Cart supports 1–20 lines, each with 1–10 items. Item subtotal must be ₱299–₱20,000 before delivery fees.
- Pizza base price is for Regular (10 inch). Large (12 inch) adds ₱150; Party (14 inch) adds ₱300.
- Classic and Thin crusts are included. Stuffed cheese adds ₱120 per pizza.
- Extra cheese ₱60, Pepperoni ₱70, Mushrooms ₱40 and Jalapeños ₱40; each topping can be chosen once per line.
- Sides/drinks use standard servings without pizza customizations.
- Demo delivery fees: Manila ₱69, Makati ₱89, Pasig ₱99. These are fictional service zones/fees, not verified restaurant service coverage. No geographic address validation is performed.
- Prices are recalculated at submission. Checkout states that confirmed prices can differ if staff changed the menu; real use should add a price-change confirmation policy.
- The request key belongs to an open checkout attempt. Repeated submissions with that key return the original order. Opening a new checkout creates a new key; it is not an account-level or cross-device deduplication system.
- Customer cancellation is allowed only while Placed. Staff can cancel Placed/Accepted orders.
- Fulfillment is Placed → Accepted → Preparing → Out for delivery → Delivered. A rider name is required before dispatch. Status updates validate the previous state.
- Cash can be recorded once after Delivered. Cancelled/Delivered are terminal. There are no reversals/refunds in the demo.

## Source map

- `app/page.tsx`: customer menu/cart/checkout/tracking and staff dashboard.
- `app/globals.css`: responsive UI, customization controls and print stylesheet.
- `app/api/pizza/route.ts`: server pricing, order creation, history and fulfillment.
- `db/schema.ts`: products, orders, items and events.
- `drizzle/`: SQLite migration and generated metadata.
- `tests/workflows.mjs`: isolated API workflow checks.
- `public/pizza-banner.png`: original generated illustrative food image; not an actual product photograph.
- `vite.config.ts`, `build/`, `scripts/`: Next.js-compatible Cloudflare Worker runtime/build.
- `.openai/hosting.json`: D1 binding DB; hosted Site identifiers are removed from the ZIP.

## API summary

GET `/api/pizza` returns menu and customization/zone configuration.

GET `/api/pizza?mode=track&reference=FS-XXXXXXXX&email=EMAIL` retrieves customer order details/history.

GET `/api/pizza?mode=staff` returns latest 500 orders.

GET `/api/pizza?mode=detail&id=ID` returns staff order details.

POST `/api/pizza` accepts JSON with action:

- seed: initialize sample menu when empty.
- product: name, description, category, priceCents; optional id updates a product.
- availability: id, available (0/1).
- order: customer, email, phone, address, zone, notes, requestKey, items [{productId,size,crust,extras,quantity}]. For sides/drinks size/crust are empty strings and extras is [].
- cancel: reference, email.
- status: id, from, status, rider when dispatching.
- payment: id.

Amounts use integer centavos. Orders/items/events are created in one transactional D1 batch. Order references and request keys are unique. An availability condition is checked inside the order INSERT; dependent foreign keys roll back a batch if it cannot create the order. Price/name/customizations are copied into order items for history.

## Deployment

The hosted private version provisions D1 and applies migrations. For independent Cloudflare deployment, create a D1 database bound as DB, apply remote migrations, configure the built Worker/static assets and deploy. Replace the local placeholder database ID. This project follows Next.js App Router conventions using a Cloudflare-specific database adapter; plain `next start` requires replacing the D1/runtime build configuration.

## Demo scope and public-use requirements

This is a functional private ordering demo, not a connected restaurant service. No real food is prepared or delivered. There is no online payment collection, courier/GPS integration, email/SMS notification, customer account, staff authentication, ingredient stock management, coupons, tax calculation, refunds or official tax invoice. Rider names are manually entered, not driver accounts. Allergen text is generic and must be replaced with verified restaurant ingredient/allergen information for real use.

Keep it private and use fictional personal details. Staff/admin endpoints have no application-level authentication; customer reference/email lookup is only demo verification. Before public/commercial use, add authenticated staff roles/API authorization, secure customer/order access, rate limits, audit logs, privacy/retention controls, backup/recovery, verified menu/allergen/service coverage and production integration tests. Integrate approved payments and courier services only when required.

Menu prices/availability are editable. Customization fees and delivery zones are configured in the route's dictionaries. Reports use the latest 500 orders, not unlimited accounting totals. Cart and checkout values stay in browser memory and reset on full reload; placed orders persist in D1. Tracking progress requires refresh and is updated manually by staff.
