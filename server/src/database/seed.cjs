const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    const databasePath = process.env.DATABASE_PATH || './data/sirko.sqlite';
    const sqlite = new Database(databasePath);

    // Create owner user
    const ownerPasswordHash = await bcrypt.hash('owner123', 10);
    const ownerResult = sqlite.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Store Owner', 'owner@sirko.com', ownerPasswordHash, 'owner');

    const owner = { id: ownerResult.lastInsertRowid };

    // Create manager user
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    const managerResult = sqlite.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Store Manager', 'manager@sirko.com', managerPasswordHash, 'manager');

    const manager = { id: managerResult.lastInsertRowid };

    // Create cashier user
    const cashierPasswordHash = await bcrypt.hash('cashier123', 10);
    const cashierResult = sqlite.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Store Cashier', 'cashier@sirko.com', cashierPasswordHash, 'cashier');

    console.log('✅ Users created');

    // Create sample branch
    const branchResult = sqlite.prepare(`
      INSERT INTO branches (owner_id, name, address, timezone)
      VALUES (?, ?, ?, ?)
    `).run(owner.id, 'Main Store', '123 Main St, Jakarta, Indonesia', 'Asia/Jakarta');

    const branch = { id: branchResult.lastInsertRowid };
    console.log('✅ Branch created');

    // Create product categories
    const beveragesResult = sqlite.prepare(`
      INSERT INTO product_categories (name, description)
      VALUES (?, ?)
    `).run('Beverages', 'Various drinks and beverages');

    const beverages = { id: beveragesResult.lastInsertRowid };

    const snacksResult = sqlite.prepare(`
      INSERT INTO product_categories (name, description)
      VALUES (?, ?)
    `).run('Snacks', 'Snack items and light meals');

    const snacks = { id: snacksResult.lastInsertRowid };
    console.log('✅ Categories created');

    // Create sample products
    const coffeeResult = sqlite.prepare(`
      INSERT INTO products (sku, name, description, category_id)
      VALUES (?, ?, ?, ?)
    `).run('COF001', 'Premium Coffee', 'High quality coffee beans', beverages.id);

    const coffee = { id: coffeeResult.lastInsertRowid };

    const teaResult = sqlite.prepare(`
      INSERT INTO products (sku, name, description, category_id)
      VALUES (?, ?, ?, ?)
    `).run('TEA001', 'Green Tea', 'Organic green tea leaves', beverages.id);

    const tea = { id: teaResult.lastInsertRowid };

    const chipsResult = sqlite.prepare(`
      INSERT INTO products (sku, name, description, category_id)
      VALUES (?, ?, ?, ?)
    `).run('SNK001', 'Potato Chips', 'Crispy potato chips', snacks.id);

    const chips = { id: chipsResult.lastInsertRowid };
    console.log('✅ Products created');

    // Create product variants
    const coffeeSmallResult = sqlite.prepare(`
      INSERT INTO product_variants (product_id, sku_variant, attributes, base_price, cost, barcode)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(coffee.id, 'COF001-S', JSON.stringify({ size: 'Small', volume: '250ml' }), 15000, 8000, '1234567890123');

    const coffeeSmall = { id: coffeeSmallResult.lastInsertRowid };

    const coffeeLargeResult = sqlite.prepare(`
      INSERT INTO product_variants (product_id, sku_variant, attributes, base_price, cost, barcode)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(coffee.id, 'COF001-L', JSON.stringify({ size: 'Large', volume: '500ml' }), 25000, 12000, '1234567890124');

    const coffeeLarge = { id: coffeeLargeResult.lastInsertRowid };

    const teaRegularResult = sqlite.prepare(`
      INSERT INTO product_variants (product_id, sku_variant, attributes, base_price, cost, barcode)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tea.id, 'TEA001-R', JSON.stringify({ size: 'Regular', volume: '300ml' }), 12000, 6000, '1234567890125');

    const teaRegular = { id: teaRegularResult.lastInsertRowid };

    const chipsOriginalResult = sqlite.prepare(`
      INSERT INTO product_variants (product_id, sku_variant, attributes, base_price, cost, barcode)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(chips.id, 'SNK001-ORG', JSON.stringify({ flavor: 'Original', weight: '100g' }), 10000, 5000, '1234567890126');

    const chipsOriginal = { id: chipsOriginalResult.lastInsertRowid };
    console.log('✅ Product variants created');

    // Create branch stock entries
    const stockInsert = sqlite.prepare(`
      INSERT INTO branch_stock (branch_id, product_variant_id, quantity, reserved, min_stock, max_stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stockInsert.run(branch.id, coffeeSmall.id, 50, 0, 10, 100);
    stockInsert.run(branch.id, coffeeLarge.id, 30, 0, 5, 50);
    stockInsert.run(branch.id, teaRegular.id, 40, 0, 8, 80);
    stockInsert.run(branch.id, chipsOriginal.id, 100, 0, 20, 200);

    console.log('✅ Branch stock initialized');

    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Owner: owner@sirko.com / owner123');
    console.log('Manager: manager@sirko.com / manager123');
    console.log('Cashier: cashier@sirko.com / cashier123');

    sqlite.close();

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}