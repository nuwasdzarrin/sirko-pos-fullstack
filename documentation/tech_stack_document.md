# Tech Stack Document for Sirko Point-of-Sale Application

This document explains the technologies behind Sirko in plain language, so everyone—from business stakeholders to non-technical team members—can understand why each tool was chosen and how it helps the project succeed.

## 1. Frontend Technologies

Our user interface is where cashiers, managers, and owners interact with Sirko. We chose tools that make development fast, interfaces consistent, and the experience snappy.

- **Vue 3**
  • A modern JavaScript framework for building interactive web pages.  
  • Its component system lets us break the UI into reusable pieces (for example, a product card, a sales table, or a login form).

- **Pinia**
  • A lightweight state management library for Vue.  
  • Keeps track of global data like the current user, selected branch, and active shopping cart in one place.

- **Vue Router**
  • Manages the pages and navigation flow.  
  • Supports "route guards," so we can block unauthorized users from certain screens (e.g., only managers see stock-opname pages).

- **Bootstrap**
  • A popular CSS framework that provides ready-made styles and components (buttons, forms, tables).  
  • Helps us keep the UI consistent and mobile-friendly without starting from scratch.

- **Vite**
  • A fast development and build tool.  
  • Offers hot module replacement (instant updates in the browser) and bundles code efficiently for production.

- **Axios (or Fetch API)**
  • Handles communication with our backend APIs.  
  • Simplifies sending requests (login, fetch sales data, update stock) and processing responses.

## 2. Backend Technologies

The server side powers all of Sirko’s logic—authentication, data storage, and report generation. We selected a lightweight, high-performance stack.

- **Bun**
  • A modern JavaScript runtime like Node.js but faster startup and build times.  
  • Runs our server code and serves static assets.

- **Elysia.js**
  • A minimal, fast web framework for Bun.  
  • Lets us define API routes (e.g., `/api/v1/auth/login`, `/api/v1/sales`) with clear structure.

- **Drizzle ORM**
  • A TypeScript-friendly library for talking to databases.  
  • We define our tables (users, branches, products, variants, stock, transactions) in code once and get type safety everywhere:
     – Prevents typos in column names  
     – Ensures our code matches the database schema  
     – Supports SQLite out of the box

- **SQLite**
  • A file-based database that lives inside a single file (`sirko.sqlite`).  
  • Perfect for small to medium data volumes and easy local setup—no external database server required.

- **Zod**
  • A library for validating data shapes.  
  • We check every API request (login, stock update, sales checkout) against a schema so we only process valid data, reducing bugs.

- **JSON Web Tokens (JWT)**
  • Securely encodes user identity and role (owner, manager, cashier).  
  • Sent with each request in an HTTP header to prove who’s making the call.

- **Middleware for Role-Based Access Control (RBAC)**
  • Server-side checks that read the JWT and allow or deny access to certain routes.  
  • Ensures, for example, that only owners can view profit reports.

- **bcrypt (or similar)**
  • Hashes user passwords before saving them to the database.  
  • Protects user credentials even if the database file is exposed.

## 3. Infrastructure and Deployment

We want Sirko to be reliable, easy to set up, and ready for growth. Here’s how we manage deployment and day-to-day operations.

- **Git & GitHub (or GitLab)**
  • Version control for tracking code changes and collaborating.  
  • Pull requests, code reviews, and branch protection ensure quality.

- **Docker & Docker Compose**
  • Encapsulate the entire application (Bun/Elysia server + SQLite) in containers.  
  • `docker-compose.yaml` spins up everything with one command, making local setup identical for all developers.

- **Multi-Stage Dockerfile**
  • Builds the Vue frontend and then packages it into the same container as the Bun server.  
  • Produces a single, lightweight image for production.

- **Environment Variables (`.env` files)**
  • Stores secrets (JWT secret, database path) and configuration outside of code.  
  • Keeps sensitive data out of version control.

- **CI/CD Pipeline (GitHub Actions)**
  • Automated checks on every push: linting code, running unit tests, building the Docker image.  
  • Deploys to staging or production when changes are merged to main.

- **Hosting Platform**
  • Any Docker-compatible service (e.g., AWS ECS, DigitalOcean App Platform, or a virtual server).  
  • Ensures easy scaling and reliable uptime.

## 4. Third-Party Integrations

Sirko keeps external dependencies minimal, focusing on core business needs. Currently, we integrate only a few key services:

- **Email Service (optional)**
  • For sending password resets or notifications, if needed.  
  • Example: SendGrid or Mailgun.

- **CSV Export**
  • Users can download reports as CSV files for offline analysis or sharing.

- **Logging & Error Tracking (optional)**
  • Services like Sentry can be plugged in to capture runtime errors and performance issues.

## 5. Security and Performance Considerations

We built Sirko to keep data safe and the user experience smooth.

### Security Measures
- **Password Hashing**: Uses bcrypt to store only hashed passwords.  
- **JWT Secrets**: Kept out of code in environment variables.  
- **RBAC Middleware**: Validates user roles on every protected route.  
- **Input Validation**: Zod checks every incoming request body.  
- **HTTPS/TLS**: Production deployments must run behind TLS for encrypted transport.

### Performance Optimizations
- **Fast Runtime**: Bun offers quicker startup and lower memory usage than traditional runtimes.  
- **SQLite Write-Ahead Logging (WAL)**: Improves concurrent reads and writes without locking the entire database.  
- **Atomic Transactions**: Drizzle ORM wraps critical operations (sales checkout, stock updates) in transactions to maintain data consistency.  
- **Code Splitting & Minification**: Vite reduces frontend bundle size for faster page loads.  
- **Docker Layer Caching**: Speeds up CI builds by reusing unchanged layers.

## 6. Conclusion and Overall Tech Stack Summary

Sirko’s technology choices balance speed, simplicity, and maintainability:

- On the **frontend**, Vue 3 with Pinia, vue-router, and Bootstrap delivers a consistent, responsive user interface.
- On the **backend**, Bun and Elysia.js provide a lightweight, high-performance server, with Drizzle ORM and SQLite ensuring a type-safe, file-based database.
- Our **infrastructure**—Docker, GitHub Actions, multi-stage builds—makes development and deployment repeatable and scalable.
- **Security** is enforced through JWT, role-based middleware, password hashing, and input validation, while **performance** is boosted by WAL mode, atomic transactions, and Bun’s fast runtime.

Unique to Sirko is the combination of a cutting-edge JavaScript runtime (Bun) with a file-based database (SQLite) and type-safe ORM (Drizzle)—all packaged into a single Docker image. This approach ensures a smooth developer experience, easy onboarding for new team members, and a robust, maintainable application for your end users.