# Sirko POS Backend Structure Document

This document outlines the backend setup for Sirko, a multi-branch point-of-sale system. It covers architecture, database design, APIs, hosting, infrastructure, security, monitoring, and maintenance in clear, everyday language.

## 1. Backend Architecture

Overall, Sirko’s backend is a single server application written in JavaScript/TypeScript, running on the Bun runtime with the Elysia.js framework. It follows a clear separation of concerns and modular design:

• Monolithic structure with logical modules (authentication, inventory, sales, reporting).  
• Elysia.js for defining routes, middleware, and request handling.  
• Drizzle ORM for type-safe database access.  
• Zod schemas for validating incoming data.  

This setup supports scalability by:

• Running multiple container instances behind a load balancer.  
• Using a lightweight runtime (Bun) for high throughput and low memory usage.  

It supports maintainability by:

• Organizing code into small, focused folders (`/api/v1`, `/db`, `/lib`, `/services`).  
• Keeping business logic in separate service files instead of in route handlers.  
• Using TypeScript types from Drizzle and Zod to catch errors early.  

It supports performance by:

• Leveraging Bun’s fast JavaScript engine and built-in HTTP server.  
• Enabling SQLite’s Write-Ahead Logging (WAL) for concurrent reads/writes.  

## 2. Database Management

Sirko uses a relational SQL database stored as a local SQLite file. We manage data with Drizzle ORM for its TypeScript support and ease of migration.

• **Type**: SQL (lightweight file-based SQLite).  
• **Library**: Drizzle ORM handles connections, queries, and migrations.  
• **Concurrency**: WAL mode enabled to allow multiple users to read/write concurrently.  
• **Backups**: Regular export of the `.sqlite` file or using `sqlite3 .backup` commands.  

Data is structured into clear tables (see Schema section). Drizzle automatically generates type definitions so developers can work with typed objects. Regular database migrations keep schema changes in sync across environments.

## 3. Database Schema

Below is a human-readable overview, followed by SQL statements to create each table.

### Human-Readable Format

• **users**: Registered system users (Owners, Managers, Cashiers). Includes email, password hash, role, and branch association.  
• **branches**: Physical store locations. Linked to users, stock, and sales.  
• **products**: Items available for sale (e.g., “Coffee Mug”).  
• **product_variants**: Variations of a product (e.g., size, color). Each has its own price and SKU.  
• **branch_stock**: Inventory levels of each variant at each branch.  
• **sales_transactions**: Completed sales, with timestamp, cashier, branch, and total amount.  
• **sales_items**: Line items for each sale, linking transactions to specific product variants and quantities.  

### SQL Schema (SQLite Format)

```sql
-- users table
ecreate table if not exists users (
  id integer primary key autoincrement,
  email text not null unique,
  password_hash text not null,
  role text not null check(role in ('owner','manager','cashier')),
  branch_id integer not null references branches(id),
  created_at datetime default current_timestamp
);

-- branches table
create table if not exists branches (
  id integer primary key autoincrement,
  name text not null,
  location text,
  created_at datetime default current_timestamp
);

-- products table
create table if not exists products (
  id integer primary key autoincrement,
  name text not null,
  description text,
  created_at datetime default current_timestamp
);

-- product_variants table
create table if not exists product_variants (
  id integer primary key autoincrement,
  product_id integer not null references products(id),
  sku text unique not null,
  price integer not null,
  created_at datetime default current_timestamp
);

-- branch_stock table
create table if not exists branch_stock (
  id integer primary key autoincrement,
  branch_id integer not null references branches(id),
  variant_id integer not null references product_variants(id),
  quantity integer not null,
  updated_at datetime default current_timestamp,
  unique(branch_id, variant_id)
);

-- sales_transactions table
create table if not exists sales_transactions (
  id integer primary key autoincrement,
  branch_id integer not null references branches(id),
  cashier_id integer not null references users(id),
  total_amount integer not null,
  created_at datetime default current_timestamp
);

-- sales_items table
create table if not exists sales_items (
  id integer primary key autoincrement,
  transaction_id integer not null references sales_transactions(id),
  variant_id integer not null references product_variants(id),
  quantity integer not null,
  price_at_sale integer not null
);
```

## 4. API Design and Endpoints

Sirko’s API follows RESTful conventions under the `/api/v1` prefix. All endpoints expect and return JSON.

### Authentication (`/api/v1/auth`)

• **POST /login**: User submits email/password. Returns a JWT on success.  
• **POST /refresh**: Exchange a refresh token for a new access token.  
• **GET /me**: Returns the logged-in user’s profile and role.  

### Inventory (`/api/v1/inventory`)

• **GET /branches**: List all branches.  
• **GET /products**: List all products and variants.  
• **GET /branches/:id/stock**: View stock levels for a branch.  
• **POST /branches/:id/stock/opname**: Adjust stock counts after a physical inventory check.  

### Sales (`/api/v1/sales`)

• **POST /**: Create a new sales transaction (cashier, branch, items).  
• **GET /**: List transactions, filterable by date or branch.  
• **GET /:id**: Get details of a specific transaction.  

### Reporting (`/api/v1/reports`)

• **GET /sales**: Summarize sales over a period.  
• **GET /profit**: Calculate profits by branch or time frame.  
• **GET /stock-movements**: Show history of stock changes.  

All endpoints run incoming data through Zod validation. Protected routes require a valid JWT in the `Authorization` header. Role-based middleware ensures only authorized users can access certain actions (e.g., only Managers can run stock opname, only Owners can view profit reports).

## 5. Hosting Solutions

For both development and production, Sirko is containerized with Docker:

• **Local Development**: Docker Compose defines services for the Bun/Elysia server and mounts a volume for the SQLite file.  
• **Production**: A multi-stage Dockerfile builds the Vue frontend, then serves static files via the Bun/Elysia container. The single image can run anywhere Docker is supported.  

You can deploy to any container host, such as:

• AWS ECS or Fargate  
• DigitalOcean App Platform  
• Kubernetes cluster  

Benefits:

• **Reliability**: Containers ensure the same environment everywhere.  
• **Scalability**: Spin up multiple instances behind a load balancer.  
• **Cost-Effectiveness**: Run on small instances or serverless containers to match demand.

## 6. Infrastructure Components

• **Load Balancer**: Distributes incoming HTTP traffic across container instances (e.g., AWS ALB, Nginx).  
• **Reverse Proxy**: Nginx or built-in Bun proxy for routing and SSL termination.  
• **Content Delivery Network (CDN)**: Serve static assets (Vue bundle) via Cloudflare or AWS CloudFront for faster global delivery.  
• **Cache**: Optional in-memory cache (e.g., LRU cache in Bun) for hot lookups like product lists.  
• **Logging**: Pino or Bun’s logger streams logs to stdout, with aggregation via ELK stack or a managed service (Logflare).  

These components work together to ensure fast, reliable responses and a responsive user experience.

## 7. Security Measures

• **HTTPS everywhere**: SSL/TLS is enforced at the load balancer or reverse proxy.  
• **JWT Authentication**: Stateles tokens with short expiration and refresh flows.  
• **Role-Based Access Control (RBAC)**: Middleware checks user role embedded in JWT before allowing certain actions.  
• **Data Validation**: Zod schemas prevent malformed or malicious input.  
• **Environment Variables**: Secrets (`JWT_SECRET`, database path) stored outside code in `.env` files or managed services (AWS Parameter Store).  
• **Database Encryption**: Host-level disk encryption protects the SQLite file at rest.  

Together, these guard against unauthorized access, protect user data, and help meet compliance needs.

## 8. Monitoring and Maintenance

• **Health Checks**: A `/health` endpoint returns service status.  
• **Metrics**: Bun’s performance metrics or integration with Prometheus to track request rates, error rates, and latency.  
• **Error Tracking**: Sentry or similar service captures runtime errors and stack traces.  
• **Automated Tests**:  
  – Unit tests (Vitest) for service logic.  
  – Integration tests for API + database.  
  – End-to-end tests (Playwright/Cypress) for key user flows.  
• **CI/CD Pipeline**: GitHub Actions or similar runs tests, builds Docker images, and deploys to staging/production.  
• **Database Migrations**: Drizzle migrations run automatically on deploy to keep schema in sync.  

Regular maintenance tasks include dependency updates, reviewing logs for errors, and rotating secrets.

## 9. Conclusion and Overall Backend Summary

Sirko’s backend is a modern, containerized application built on Bun and Elysia.js. It pairs a type-safe data layer (Drizzle ORM + SQLite) with clear, versioned APIs secured by JWT and RBAC. Modular design, automated testing, and containerization make it maintainable and scalable. Infrastructure components like load balancers, CDNs, and monitoring tools ensure reliability and performance.

This setup aligns with Sirko’s goals: fast development, secure multi-branch support, precise inventory control, and insightful reporting. By following these guidelines, you’ll have a robust backend that grows with your business and keeps your users—and data—safe.