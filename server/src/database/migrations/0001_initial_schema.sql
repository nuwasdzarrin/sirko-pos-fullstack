-- Initial migration for Sirko POS database
-- This migration creates all necessary tables for the POS system

-- Users table for authentication and RBAC
CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now'))
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");

-- Branches table for multi-branch support
CREATE TABLE IF NOT EXISTS "branches" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"owner_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"timezone" text DEFAULT 'Asia/Jakarta',
	"is_active" integer DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- Product categories for organization
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now'))
);

-- Products table
CREATE TABLE IF NOT EXISTS "products" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"sku" text,
	"name" text NOT NULL,
	"description" text,
	"category_id" integer,
	"is_active" integer DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON UPDATE no action ON DELETE no action
);

-- Create unique index on SKU
CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_unique" ON "products" ("sku");

-- Product variants (for size/color/packaging variations)
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"product_id" integer NOT NULL,
	"sku_variant" text,
	"attributes" text,
	"base_price" real NOT NULL,
	"cost" real NOT NULL,
	"barcode" text,
	"is_active" integer DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("product_id") REFERENCES "products"("id") ON UPDATE no action ON DELETE no action
);

-- Create unique index on variant SKU
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_variant_unique" ON "product_variants" ("sku_variant");

-- Branch stock table - tracks inventory per branch per variant
CREATE TABLE IF NOT EXISTS "branch_stock" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"branch_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"max_stock" integer,
	"updated_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON UPDATE no action ON DELETE no action
);

-- Create composite index for efficient stock queries
CREATE UNIQUE INDEX IF NOT EXISTS "branch_stock_branch_id_product_variant_id_unique" ON "branch_stock" ("branch_id", "product_variant_id");

-- Purchase orders for restocking
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"branch_id" integer NOT NULL,
	"supplier" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" real DEFAULT 0,
	"created_by" integer NOT NULL,
	"notes" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS "purchase_order_lines" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"quantity_ordered" integer NOT NULL,
	"quantity_received" integer DEFAULT 0,
	"unit_price" real NOT NULL,
	"total" real NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON UPDATE no action ON DELETE no action
);

-- Sales transactions
CREATE TABLE IF NOT EXISTS "sales_transactions" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"branch_id" integer NOT NULL,
	"cashier_id" integer NOT NULL,
	"transaction_number" text NOT NULL,
	"total_amount" real NOT NULL,
	"total_cost" real NOT NULL,
	"tax" real DEFAULT 0,
	"discount" real DEFAULT 0,
	"payment_method" text,
	"payment_amount" real,
	"change_amount" real,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"updated_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("cashier_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- Create unique index on transaction number
CREATE UNIQUE INDEX IF NOT EXISTS "sales_transactions_transaction_number_unique" ON "sales_transactions" ("transaction_number");

-- Sales transaction line items
CREATE TABLE IF NOT EXISTS "sales_lines" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"sales_transaction_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" real NOT NULL,
	"unit_cost" real NOT NULL,
	"total" real NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("sales_transaction_id") REFERENCES "sales_transactions"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON UPDATE no action ON DELETE no action
);

-- Stock opname (stock count) sessions
CREATE TABLE IF NOT EXISTS "stock_opnames" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"branch_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"notes" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"completed_at" integer,
	FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- Stock opname line items
CREATE TABLE IF NOT EXISTS "stock_opname_lines" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"stock_opname_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"recorded_qty" integer NOT NULL,
	"counted_qty" integer NOT NULL,
	"difference" integer NOT NULL,
	"adjustment_reason" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("stock_opname_id") REFERENCES "stock_opnames"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON UPDATE no action ON DELETE no action
);

-- Stock transfers between branches
CREATE TABLE IF NOT EXISTS "stock_transfers" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"from_branch_id" integer NOT NULL,
	"to_branch_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_by" integer NOT NULL,
	"approved_by" integer,
	"notes" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	"completed_at" integer,
	FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- Stock transfer line items
CREATE TABLE IF NOT EXISTS "stock_transfer_lines" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"stock_transfer_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("stock_transfer_id") REFERENCES "stock_transfers"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON UPDATE no action ON DELETE no action
);

-- Audit logs for tracking changes
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" integer NOT NULL,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- User branch assignments (for managers)
CREATE TABLE IF NOT EXISTS "user_branch_assignments" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"user_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"assigned_by" integer NOT NULL,
	"assigned_at" integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "sales_transactions_branch_id_created_at_idx" ON "sales_transactions" ("branch_id", "created_at");
CREATE INDEX IF NOT EXISTS "sales_lines_sales_transaction_id_idx" ON "sales_lines" ("sales_transaction_id");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON "audit_logs" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_entity_id_idx" ON "audit_logs" ("entity", "entity_id");
CREATE INDEX IF NOT EXISTS "branch_stock_updated_at_idx" ON "branch_stock" ("updated_at");