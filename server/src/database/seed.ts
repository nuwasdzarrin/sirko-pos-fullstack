#!/usr/bin/env bun
import bcrypt from 'bcrypt';
import { db } from './index';
import { users, branches, productCategories, products, productVariants, branchStock } from './schema';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create owner user
    const ownerPasswordHash = await bcrypt.hash('owner123', 10);
    const [owner] = await db.insert(users).values({
      name: 'Store Owner',
      email: 'owner@sirko.com',
      passwordHash: ownerPasswordHash,
      role: 'owner',
    }).returning();

    // Create manager user
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    const [manager] = await db.insert(users).values({
      name: 'Store Manager',
      email: 'manager@sirko.com',
      passwordHash: managerPasswordHash,
      role: 'manager',
    }).returning();

    // Create cashier user
    const cashierPasswordHash = await bcrypt.hash('cashier123', 10);
    const [cashier] = await db.insert(users).values({
      name: 'Store Cashier',
      email: 'cashier@sirko.com',
      passwordHash: cashierPasswordHash,
      role: 'cashier',
    }).returning();

    console.log('✅ Users created');

    // Create sample branch
    const [branch] = await db.insert(branches).values({
      ownerId: owner.id,
      name: 'Main Store',
      address: '123 Main St, Jakarta, Indonesia',
      timezone: 'Asia/Jakarta',
    }).returning();

    console.log('✅ Branch created');

    // Create product categories
    const [beveragesCategory] = await db.insert(productCategories).values({
      name: 'Beverages',
      description: 'Various drinks and beverages',
    }).returning();

    const [snacksCategory] = await db.insert(productCategories).values({
      name: 'Snacks',
      description: 'Snack items and light meals',
    }).returning();

    console.log('✅ Categories created');

    // Create sample products
    const [coffeeProduct] = await db.insert(products).values({
      sku: 'COF001',
      name: 'Premium Coffee',
      description: 'High quality coffee beans',
      categoryId: beveragesCategory.id,
    }).returning();

    const [teaProduct] = await db.insert(products).values({
      sku: 'TEA001',
      name: 'Green Tea',
      description: 'Organic green tea leaves',
      categoryId: beveragesCategory.id,
    }).returning();

    const [chipsProduct] = await db.insert(products).values({
      sku: 'SNK001',
      name: 'Potato Chips',
      description: 'Cr crispy potato chips',
      categoryId: snacksCategory.id,
    }).returning();

    console.log('✅ Products created');

    // Create product variants
    const [coffeeSmall] = await db.insert(productVariants).values({
      productId: coffeeProduct.id,
      skuVariant: 'COF001-S',
      attributes: JSON.stringify({ size: 'Small', volume: '250ml' }),
      basePrice: 15000,
      cost: 8000,
      barcode: '1234567890123',
    }).returning();

    const [coffeeLarge] = await db.insert(productVariants).values({
      productId: coffeeProduct.id,
      skuVariant: 'COF001-L',
      attributes: JSON.stringify({ size: 'Large', volume: '500ml' }),
      basePrice: 25000,
      cost: 12000,
      barcode: '1234567890124',
    }).returning();

    const [teaRegular] = await db.insert(productVariants).values({
      productId: teaProduct.id,
      skuVariant: 'TEA001-R',
      attributes: JSON.stringify({ size: 'Regular', volume: '300ml' }),
      basePrice: 12000,
      cost: 6000,
      barcode: '1234567890125',
    }).returning();

    const [chipsOriginal] = await db.insert(productVariants).values({
      productId: chipsProduct.id,
      skuVariant: 'SNK001-ORG',
      attributes: JSON.stringify({ flavor: 'Original', weight: '100g' }),
      basePrice: 10000,
      cost: 5000,
      barcode: '1234567890126',
    }).returning();

    console.log('✅ Product variants created');

    // Create branch stock entries
    await db.insert(branchStock).values([
      {
        branchId: branch.id,
        productVariantId: coffeeSmall.id,
        quantity: 50,
        reserved: 0,
        minStock: 10,
        maxStock: 100,
      },
      {
        branchId: branch.id,
        productVariantId: coffeeLarge.id,
        quantity: 30,
        reserved: 0,
        minStock: 5,
        maxStock: 50,
      },
      {
        branchId: branch.id,
        productVariantId: teaRegular.id,
        quantity: 40,
        reserved: 0,
        minStock: 8,
        maxStock: 80,
      },
      {
        branchId: branch.id,
        productVariantId: chipsOriginal.id,
        quantity: 100,
        reserved: 0,
        minStock: 20,
        maxStock: 200,
      },
    ]);

    console.log('✅ Branch stock initialized');

    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Owner: owner@sirko.com / owner123');
    console.log('Manager: manager@sirko.com / manager123');
    console.log('Cashier: cashier@sirko.com / cashier123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (import.meta.main) {
  seedDatabase();
}