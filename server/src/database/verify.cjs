const Database = require('better-sqlite3');
require('dotenv').config({ path: '.env' });

function verifyDatabase() {
  try {
    console.log('🔍 Verifying database setup...');

    const databasePath = process.env.DATABASE_PATH || './data/sirko.sqlite';
    const sqlite = new Database(databasePath);

    // Check if tables exist
    const tables = sqlite.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();

    console.log('📋 Tables found:', tables.map(t => t.name));

    // Check users
    const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log('👥 Users created:', userCount.count);

    // Check branches
    const branchCount = sqlite.prepare('SELECT COUNT(*) as count FROM branches').get();
    console.log('🏪 Branches created:', branchCount.count);

    // Check products
    const productCount = sqlite.prepare('SELECT COUNT(*) as count FROM products').get();
    console.log('📦 Products created:', productCount.count);

    // Check product variants
    const variantCount = sqlite.prepare('SELECT COUNT(*) as count FROM product_variants').get();
    console.log('🏷️  Product variants created:', variantCount.count);

    // Check branch stock
    const stockCount = sqlite.prepare('SELECT COUNT(*) as count FROM branch_stock').get();
    console.log('📊 Branch stock entries:', stockCount.count);

    console.log('✅ Database verification complete!');

    sqlite.close();

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyDatabase();
}