import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.model.js';
import Order from './src/models/Order.model.js';

dotenv.config();

// Ensure we point to the analytics database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_analytics';

const seedMaster = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // --- CONFIGURATION ---
    const NEW_PRODUCT = {
      sku: 'Lenovo loqX1-1TB',
      name: 'Lenovo loqX1 (1TB)',
      category: 'Electronics',
      price: 89000.00,
      current_stock: 200,
      low_stock_threshold: 10
    };

    // 1. Create Product
    let productDoc = await Product.findOne({ sku: NEW_PRODUCT.sku });
    if (!productDoc) {
      console.log(`🆕 Creating new product: ${NEW_PRODUCT.name}...`);
      productDoc = await Product.create(NEW_PRODUCT);
      console.log(`✅ Product Created! ID: ${productDoc._id}`);
    } else {
      console.log(`ℹ️ Using existing product: ${NEW_PRODUCT.sku}`);
    }

    // 2. Generate History
    console.log(`🌱 Seeding 30 days of orders for ${NEW_PRODUCT.sku}...`);
    
    const orders = [];
    const today = new Date();
    const MOCK_USER_ID = new mongoose.Types.ObjectId('64e6b1d5c9e77c001f6a1a1b');

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i); // Go back 'i' days

      const dailyOrders = Math.floor(Math.random() * 5) + 2;

      for (let j = 0; j < dailyOrders; j++) {
        const qty = Math.floor(Math.random() * 3) + 1;
        
        orders.push({
          order_id: `AUTO-${date.getTime()}-${j}`,
          placed_by: MOCK_USER_ID,
          items: [{
            product_id: productDoc._id,
            qty: qty,
            price_at_sale: NEW_PRODUCT.price
          }],
          total_amount: qty * NEW_PRODUCT.price,
          status: 'COMPLETED',
          placed_at: date,
          
          // 🚨 CRITICAL FIX: Explicitly backdate the creation time
          // so the ETL service counts this as a past event.
          createdAt: date, 
          updatedAt: date
        });
      }
    }

    // 3. Batch Insert
    await Order.insertMany(orders);
    console.log(`🚀 Successfully backfilled ${orders.length} orders.`);
    console.log('🔮 The Analytics Engine will now see 30 distinct days of history.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

seedMaster();