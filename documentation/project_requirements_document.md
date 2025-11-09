# Sirko POS Application - Project Requirements Document

## 1. Project Overview

Sirko is a modern, multi-branch point-of-sale (POS) and inventory management system designed for small to medium retail businesses. It provides three distinct user roles—Owner, Manager, and Cashier—each with tailored dashboards and permissions. Cashiers process sales in real time, Managers oversee stock levels and perform stock reconciliations (stock opname), and Owners access high-level sales and profit reports across all branches.

The core problem Sirko solves is inaccurate stock tracking and fragmented sales data in multi-location retail environments. By unifying sales transactions, branch-level inventory, and reporting under one responsive web application, Sirko streamlines daily operations and ensures data integrity. Success will be measured by sub-second transaction processing, zero data loss during concurrent sales, and intuitive dashboards that require minimal training.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1):**

- User authentication & authorization with JSON Web Tokens (JWT).
- Role-based access control (RBAC) for Owner, Manager, and Cashier.
- Multi-branch support: define branches and assign users.
- Inventory management: products, product variants, and branch-specific stock.
- Stock opname flow: Managers can enter physical counts and reconcile differences.
- POS interface: scan or select items, adjust quantities, complete checkout, and print/display receipts.
- Sales transaction handling: atomic database operations to decrement stock and record sales.
- Reporting & analytics: sales summaries by period, branch, product, and monthly profit calculations; CSV export.
- RESTful API implemented in Elysia.js, with Zod validation and Drizzle ORM for SQLite.
- Frontend in Vue 3 with Pinia state management, vue-router route guards, and Bootstrap styling.
- Containerized development and deployment via Docker Compose and a multi-stage Bun Dockerfile.

**Out-of-Scope (Later Phases):**

- Integration with external payment gateways (credit cards, mobile wallets).
- Offline or PWA mode for disconnected environments.
- Native mobile applications (iOS/Android).
- Loyalty programs, promotions, or gift cards.
- Multi-currency or tax calculation modules.
- Third-party accounting or ERP integrations.

## 3. User Flow

A new or existing user visits the Sirko web app and is presented with a login screen. They enter credentials, which the Vue 3 client sends to `POST /api/v1/auth/login`. Elysia.js validates the request via a Zod schema, checks the Drizzle ORM–backed SQLite database for matching credentials, and returns a signed JWT. The client stores the token securely (e.g., httpOnly cookie or local storage) and redirects the user to their role-specific dashboard.

Once authenticated, navigation is handled by vue-router. Cashiers land on the POS screen where they can scan barcodes or search products, build a shopping cart, and complete checkouts. Each sale triggers an API call that wraps stock decrement and sales record creation in a transaction. Managers see a sidebar link to “Stock Opname,” enter physical counts, reconcile with system counts, and review branch stock levels. Owners access an analytics dashboard to filter and download sales and profit reports across all branches.

## 4. Core Features

- **Authentication & RBAC**: JWT-based login, refresh tokens, and middleware to enforce role permissions.
- **Multi-Branch Management**: CRUD operations for branches; assign users to branches.
- **Inventory & Stock**: Product and variant definitions; branch_stock table; stock opname reconciliation.
- **POS Interface**: Responsive cart management, barcode scanning support, receipt printing/display.
- **Sales Transactions**: Atomic operations with Drizzle ORM; stock decrement and sale entry in one transaction.
- **Reporting & Export**: Dynamic SQL queries for sales trends and profit; interactive tables and CSV download.
- **API Routes (/api/v1)**:
  - `/auth` (login, refresh, me)
  - `/inventory` (products, stock, opname)
  - `/sales` (checkout, history)
  - `/reports` (metrics, CSV)
- **Data Validation**: Zod schemas for all request bodies and parameters.
- **State Management**: Pinia store for user session, selected branch, and shopping cart.
- **UI Framework**: Vue 3 with Bootstrap for consistent styling and responsive design.
- **Containerization**: Docker Compose for local dev; multi-stage Dockerfile for production.

## 5. Tech Stack & Tools

- **Frontend:** Vue 3, TypeScript, vue-router, Pinia, Bootstrap 5.
- **Backend:** Bun runtime, Elysia.js, TypeScript.
- **Database:** SQLite (file-based) with Drizzle ORM (TypeScript-first schema).
- **Validation:** Zod for request and response schemas.
- **Containerization:** Docker, Docker Compose; multi-stage Bun Dockerfile.
- **Development Tools:** VS Code, ESLint, Prettier.
- **Testing (future):** Vitest for unit tests, Cypress or Playwright for end-to-end tests.

## 6. Non-Functional Requirements

- **Performance:**
  - API response times under 100 ms for reads; under 200 ms for writes on a local network.
  - Frontend route transitions within 500 ms.
- **Scalability:** Designed for up to 50 concurrent cashiers; future DB migration path to PostgreSQL.
- **Security:**
  - HTTPS everywhere; secure storage of JWTs.
  - OWASP Top 10 compliance; input sanitization and strict validation.
- **Reliability:**
  - Atomic DB transactions for all write operations.
  - SQLite in WAL mode to improve concurrency.
- **Usability:**
  - Responsive design for tablets and laptops.
  - Accessible forms (ARIA labels, proper focus management).

## 7. Constraints & Assumptions

- **SQLite as Primary DB:** Single file database with WAL; assumes low to moderate concurrency.
- **Bun & Elysia Availability:** Bun runtime must support all dependencies; Elysia.js middleware for JWT.
- **Single-Tenant Deployment:** One organization per instance; no multi-tenant support in V1.
- **Environment Variables:** `.env` for `JWT_SECRET`, database path, and other secrets.
- **Hardware:** Barcode scanner integrated as keyboard input.

## 8. Known Issues & Potential Pitfalls

- **SQLite Concurrency Limits:** Even with WAL, heavy simultaneous writes could cause locks. Mitigation: keep transactions short and consider migrating to PostgreSQL in later phases.
- **Receipt Printing Across Browsers:** Browser print styles vary; standardize CSS print media rules and test on Chrome/Firefox.
- **Role Escalation:** Flawed RBAC middleware could expose unauthorized routes. Mitigation: write comprehensive unit tests for middleware and protected endpoints.
- **Data Corruption on Crash:** Ensure graceful shutdown and database backups; consider periodic exports or snapshot backups.
- **Scaling Beyond Local:** Docker Compose is great for dev and small deployments; plan for Kubernetes or managed container services if growth demands.

---

This document serves as the definitive guide for Sirko’s initial development. All subsequent technical designs (architecture diagrams, file structures, API specs) will reference these requirements to maintain consistency and avoid ambiguity.