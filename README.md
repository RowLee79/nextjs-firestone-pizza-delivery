# Firestone — Online Pizza Delivery System

A working Next.js App Router / React / TypeScript pizza ordering project with persistent orders, a customer menu and a staff fulfillment dashboard. This distribution uses Vinext (a Next.js API-compatible Cloudflare runtime), Cloudflare D1 SQLite and Drizzle migrations. Prices are in Philippine pesos and timestamps display in Manila time.

Portfolio demonstration by RowLee Tanawan. The implementation uses Next.js-compatible App Router APIs with the Vinext runtime; deployment targets Cloudflare Workers. It is not a conventional standalone `next dev` deployment.

## Features

- Searchable menu, Pizza/Sides/Drinks filters and availability controls.
- Regular/Large/Party pizzas, Classic/Thin/Stuffed cheese crusts, four optional toppings and quantity selection.
- Cart with quantity updates, item removal, minimum subtotal and delivery fees by zone.
- Delivery checkout: name, email, phone, street address, zone and instructions.
- Cash-on-delivery demo orders; server recalculates prices from the menu rather than trusting client totals.
- Retry idempotency within a checkout attempt prevents duplicate submissions with the same request key.

## Technology

React, TypeScript, Next.js-compatible App Router, Vinext, Vite and responsive CSS. Cloudflare D1 SQLite and Drizzle migrations provide persistent data.

## Run locally

Node.js 22.13+ is required. Follow [installation, database initialization and walkthrough instructions](docs/SETUP.md), including the project-specific migration command. Dependencies and local database files are excluded from source control.

## Screenshots

Actual application screenshots are pending capture. No mockup is presented as a running application screenshot.

## Project layout

- `app/page.tsx`: application interface
- `app/globals.css`: responsive styling
- `app/api/`: server workflows, where applicable
- `db/` and `drizzle/`: schema and migrations, where applicable
- `docs/SETUP.md`: full setup, workflow rules and limitations

## Demo scope

Use fictional data for portfolio demonstrations. See [documented limitations](docs/SETUP.md) before deployment; authentication, payment integrations and operational safeguards vary by project and are not implied by the portfolio presentation.
