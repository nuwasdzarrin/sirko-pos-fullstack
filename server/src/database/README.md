# Sirko POS Database Schema

This directory contains the complete database schema and migration system for the Sirko POS application.

## Database Structure

The database is implemented using SQLite with Drizzle ORM and includes the following main tables:

### Core Tables

1. **users** - User authentication and role-based access control
   - Roles: owner, manager, cashier
   - Supports RBAC (Role-Based Access Control)

2. **branches** - Multi-branch store management
   - Each store location with timezone support
   - Owner assignment for multi-branch ownership

3. **product_categories** - Product categorization
   - Organize products by categories

4. **products** - Core product information
   - SKU, name, description, category assignment

5. **product_variants** - Product variations (size, color, packaging)
   - Variant-aware pricing
   - Barcode support
   - JSON attributes for flexible variant properties

6. **branch_stock** - Inventory tracking per branch
   - Quantity, reserved stock, min/max stock levels
   - Prevents overselling with reservation system

### Transaction Tables

7. **purchase_orders** - Restocking and procurement
   - Supplier management
   - Status tracking (pending, partial, completed)

8. **purchase_order_lines** - Purchase order line items
   - Quantity tracking (ordered vs received)

9. **sales_transactions** - Sales transaction records
   - Payment methods, tax, discount tracking
   - Cost and profit calculation snapshots

10. **sales_lines** - Individual sale line items
    - Product variant, quantity, price, cost tracking

### Inventory Management Tables

11. **stock_opnames** - Stock count sessions
    - Physical inventory counting
    - Status tracking (in_progress, completed)

12. **stock_opname_lines** - Stock count details
    - Recorded vs counted quantities
    - Difference calculations

13. **stock_transfers** - Inter-branch stock transfers
    - From/to branch tracking
    - Approval workflow

14. **stock_transfer_lines** - Transfer line items

### Audit and Security Tables

15. **audit_logs** - Comprehensive audit trail
    - User action tracking
    - IP address and user agent logging

16. **user_branch_assignments** - Manager branch assignments
    - Multi-branch manager support

## Key Features

### Multi-Branch Support
- Each branch maintains separate inventory
- Inter-branch stock transfers
- Role-based branch access

### Variant-Aware Pricing
- Products can have multiple variants
- Each variant has independent pricing
- Flexible attributes using JSON storage

### Stock Management
- Real-time inventory tracking
- Stock reservation for pending transactions
- Low stock alerts
- Stock opname (physical counting) support

### Audit Trail
- Complete audit logging of all changes
- User action tracking
- IP and device logging

### Performance Optimizations
- WAL mode for better concurrency
- Proper indexing on frequently queried columns
- Composite indexes for complex queries

## Migration System

The migration system uses:

- **SQL migrations** in `/src/database/migrations/`
- **Migration tracking** via `__drizzle_migrations` table
- **Manual migration scripts** for database setup

### Available Scripts

- `npm run migrate` - Run database migrations
- `npm run db:seed` - Populate database with sample data
- `node src/database/verify.cjs` - Verify database setup

## Database File

- **Location**: `./data/sirko.sqlite` (configurable via `DATABASE_PATH`)
- **Format**: SQLite with WAL mode enabled
- **Foreign Keys**: Enforced for data integrity

## Sample Data

The seed script creates:
- 3 Users (Owner, Manager, Cashier)
- 1 Branch (Main Store)
- 2 Product Categories (Beverages, Snacks)
- 3 Products with 4 variants
- Initial stock levels

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Comprehensive audit logging
- SQL injection prevention via parameterized queries

## Concurrency

- SQLite WAL mode for better read/write concurrency
- Stock reservation system prevents overselling
- Transaction-based operations for data consistency

This database schema provides a solid foundation for a multi-branch POS system with comprehensive inventory management, audit trails, and role-based security.