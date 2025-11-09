import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table for authentication and RBAC
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['owner', 'manager', 'cashier'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Branches table for multi-branch support
export const branches = sqliteTable('branches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  address: text('address'),
  timezone: text('timezone').default('Asia/Jakarta'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Product categories for organization
export const productCategories = sqliteTable('product_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Products table
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').unique(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => productCategories.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Product variants (for size/color/packaging variations)
export const productVariants = sqliteTable('product_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  skuVariant: text('sku_variant').unique(),
  attributes: text('attributes', { mode: 'json' }), // JSON for size, color, etc.
  basePrice: real('base_price').notNull(), // Variant-specific pricing
  cost: real('cost').notNull(), // Cost for profit calculations
  barcode: text('barcode'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Branch stock table - tracks inventory per branch per variant
export const branchStock = sqliteTable('branch_stock', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id),
  quantity: integer('quantity').default(0).notNull(),
  reserved: integer('reserved').default(0).notNull(), // Reserved for ongoing transactions
  minStock: integer('min_stock').default(0).notNull(), // Alert threshold
  maxStock: integer('max_stock'), // Maximum stock capacity
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Purchase orders for restocking
export const purchaseOrders = sqliteTable('purchase_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  supplier: text('supplier').notNull(),
  status: text('status', { enum: ['pending', 'partial', 'completed', 'cancelled'] }).default('pending'),
  totalAmount: real('total_amount').default(0),
  createdBy: integer('created_by').notNull().references(() => users.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Purchase order line items
export const purchaseOrderLines = sqliteTable('purchase_order_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  purchaseOrderId: integer('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id),
  quantityOrdered: integer('quantity_ordered').notNull(),
  quantityReceived: integer('quantity_received').default(0),
  unitPrice: real('unit_price').notNull(),
  total: real('total').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sales transactions
export const salesTransactions = sqliteTable('sales_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  cashierId: integer('cashier_id').notNull().references(() => users.id),
  transactionNumber: text('transaction_number').unique().notNull(),
  totalAmount: real('total_amount').notNull(),
  totalCost: real('total_cost').notNull(), // For profit calculations
  tax: real('tax').default(0),
  discount: real('discount').default(0),
  paymentMethod: text('payment_method', { enum: ['cash', 'card', 'transfer', 'other'] }),
  paymentAmount: real('payment_amount'),
  changeAmount: real('change_amount'),
  status: text('status', { enum: ['pending', 'completed', 'cancelled', 'refunded'] }).default('pending'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sales transaction line items
export const salesLines = sqliteTable('sales_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salesTransactionId: integer('sales_transaction_id').notNull().references(() => salesTransactions.id, { onDelete: 'cascade' }),
  productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  unitCost: real('unit_cost').notNull(),
  total: real('total').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Stock opname (stock count) sessions
export const stockOpnames = sqliteTable('stock_opnames', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  createdBy: integer('created_by').notNull().references(() => users.id),
  status: text('status', { enum: ['in_progress', 'completed', 'cancelled'] }).default('in_progress'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Stock opname line items
export const stockOpnameLines = sqliteTable('stock_opname_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stockOpnameId: integer('stock_opname_id').notNull().references(() => stockOpnames.id, { onDelete: 'cascade' }),
  productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id),
  recordedQty: integer('recorded_qty').notNull(), // System quantity before count
  countedQty: integer('counted_qty').notNull(), // Physical count
  difference: integer('difference').notNull(), // counted - recorded
  adjustmentReason: text('adjustment_reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Stock transfers between branches
export const stockTransfers = sqliteTable('stock_transfers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromBranchId: integer('from_branch_id').notNull().references(() => branches.id),
  toBranchId: integer('to_branch_id').notNull().references(() => branches.id),
  status: text('status', { enum: ['pending', 'in_transit', 'completed', 'cancelled'] }).default('pending'),
  requestedBy: integer('requested_by').notNull().references(() => users.id),
  approvedBy: integer('approved_by').references(() => users.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Stock transfer line items
export const stockTransferLines = sqliteTable('stock_transfer_lines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stockTransferId: integer('stock_transfer_id').notNull().references(() => stockTransfers.id, { onDelete: 'cascade' }),
  productVariantId: integer('product_variant_id').notNull().references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Audit logs for tracking changes
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // create, update, delete, login, etc.
  entity: text('entity').notNull(), // product, sale, purchase_order, etc.
  entityId: integer('entity_id').notNull(),
  details: text('details', { mode: 'json' }), // JSON with change details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// User branch assignments (for managers)
export const userBranchAssignments = sqliteTable('user_branch_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  assignedBy: integer('assigned_by').notNull().references(() => users.id),
  assignedAt: integer('assigned_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  branches: many(branches),
  purchaseOrders: many(purchaseOrders),
  salesTransactions: many(salesTransactions),
  stockOpnames: many(stockOpnames),
  stockTransfers: many(stockTransfers),
  auditLogs: many(auditLogs),
  userBranchAssignments: many(userBranchAssignments),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  branchStock: many(branchStock),
  purchaseOrders: many(purchaseOrders),
  salesTransactions: many(salesTransactions),
  stockOpnames: many(stockOpnames),
  stockTransfersFrom: many(stockTransfers, { relationName: 'fromBranch' }),
  stockTransfersTo: many(stockTransfers, { relationName: 'toBranch' }),
  userBranchAssignments: many(userBranchAssignments),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ many }) => ({
  branchStock: many(branchStock),
  purchaseOrderLines: many(purchaseOrderLines),
  salesLines: many(salesLines),
  stockOpnameLines: many(stockOpnameLines),
  stockTransferLines: many(stockTransferLines),
}));

export const branchStockRelations = relations(branchStock, ({ one }) => ({
  branch: one(branches, { references: [branches.id], fields: [branchStock.branchId] }),
  productVariant: one(productVariants, { references: [productVariants.id], fields: [branchStock.productVariantId] }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  branch: one(branches, { references: [branches.id], fields: [purchaseOrders.branchId] }),
  createdBy: one(users, { references: [users.id], fields: [purchaseOrders.createdBy] }),
  lines: many(purchaseOrderLines),
}));

export const purchaseOrderLinesRelations = relations(purchaseOrderLines, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, { references: [purchaseOrders.id], fields: [purchaseOrderLines.purchaseOrderId] }),
  productVariant: one(productVariants, { references: [productVariants.id], fields: [purchaseOrderLines.productVariantId] }),
}));

export const salesTransactionsRelations = relations(salesTransactions, ({ one, many }) => ({
  branch: one(branches, { references: [branches.id], fields: [salesTransactions.branchId] }),
  cashier: one(users, { references: [users.id], fields: [salesTransactions.cashierId] }),
  lines: many(salesLines),
}));

export const salesLinesRelations = relations(salesLines, ({ one }) => ({
  salesTransaction: one(salesTransactions, { references: [salesTransactions.id], fields: [salesLines.salesTransactionId] }),
  productVariant: one(productVariants, { references: [productVariants.id], fields: [salesLines.productVariantId] }),
}));

export const stockOpnamesRelations = relations(stockOpnames, ({ one, many }) => ({
  branch: one(branches, { references: [branches.id], fields: [stockOpnames.branchId] }),
  createdBy: one(users, { references: [users.id], fields: [stockOpnames.createdBy] }),
  lines: many(stockOpnameLines),
}));

export const stockOpnameLinesRelations = relations(stockOpnameLines, ({ one }) => ({
  stockOpname: one(stockOpnames, { references: [stockOpnames.id], fields: [stockOpnameLines.stockOpnameId] }),
  productVariant: one(productVariants, { references: [productVariants.id], fields: [stockOpnameLines.productVariantId] }),
}));

export const stockTransfersRelations = relations(stockTransfers, ({ one, many }) => ({
  fromBranch: one(branches, { references: [branches.id], fields: [stockTransfers.fromBranchId], relationName: 'fromBranch' }),
  toBranch: one(branches, { references: [branches.id], fields: [stockTransfers.toBranchId], relationName: 'toBranch' }),
  requestedBy: one(users, { references: [users.id], fields: [stockTransfers.requestedBy] }),
  approvedBy: one(users, { references: [users.id], fields: [stockTransfers.approvedBy] }),
  lines: many(stockTransferLines),
}));

export const stockTransferLinesRelations = relations(stockTransferLines, ({ one }) => ({
  stockTransfer: one(stockTransfers, { references: [stockTransfers.id], fields: [stockTransferLines.stockTransferId] }),
  productVariant: one(productVariants, { references: [productVariants.id], fields: [stockTransferLines.productVariantId] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [auditLogs.userId] }),
}));

export const userBranchAssignmentsRelations = relations(userBranchAssignments, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [userBranchAssignments.userId] }),
  branch: one(branches, { references: [branches.id], fields: [userBranchAssignments.branchId] }),
  assignedBy: one(users, { references: [users.id], fields: [userBranchAssignments.assignedBy] }),
}));