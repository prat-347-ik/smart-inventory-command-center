// service-operational/scripts/seed-orders-history.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid'; // You might need to install this or use a simple randomizer

// 1. Config & Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

// --- FIX 1: Force Connection to 'inventory_db' ---
// Even if .env points to 'inventory_analytics', we force the correct DB name here.
let connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';
try {
  const urlObj = new URL(connectionString);
  urlObj.pathname = '/inventory_analytics';//FORCE         L DB
  connectionString = urlObj.toString();
} catch (e) {
  // If URL parsing fails, fall back to default local
  connectionString = 'mongodb://localhost:27017/inventory_db';
}

const SKU = 'MACBOOK-PRO-M3';
const PRICE = 2000;
const DAYS_HISTORY = 45; 

// 2. Define Schema with order_id
const OrderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true }, // <--- FIX 2: Added Field
  customer_id: { type: String, default: 'SEED_BOT' },
  items: [{
    product_sku: String,
    quantity: Number,
    price: Number
  }],
  total_amount: Number,
  status: { type: String, default: 'COMPLETED' },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

// 3. Holidays
const HOLIDAYS = [
  "2023-11-24", "2023-12-25", 
  "2024-01-01", "2024-11-29", "2024-12-25",
  "2025-01-01", "2025-05-26", "2025-07-04", 
  "2025-11-27", "2025-11-28", "2025-12-25"
];

const generateOrders = async () => {
  console.log(`🔌 Connecting to Operational DB: ${connectionString}`);
  
  try {
      await mongoose.connect(connectionString);
  } catch (err) {
      console.error("❌ Connection Failed:", err.message);
      process.exit(1);
  }

  console.log(`🧹 Cleaning old orders for ${SKU}...`);
  await Order.deleteMany({ "items.product_sku": SKU, customer_id: 'SEED_BOT' });

  const ordersToInsert = [];
  const now = new Date();

  console.log(`🌱 Generating ${DAYS_HISTORY} days of Order history...`);

  for (let i = DAYS_HISTORY; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    // --- Demand Logic ---
    let dailyDemand = 3; 

    // Weekend Multiplier
    if (dayOfWeek === 5) dailyDemand = 5; // Fri
    if (dayOfWeek === 6) dailyDemand = 7; // Sat
    if (dayOfWeek === 0) dailyDemand = 4; // Sun

    // Holiday Spike
    if (HOLIDAYS.includes(dateStr)) {
      console.log(`   🎉 Holiday Spike on ${dateStr}!`);
      dailyDemand = Math.floor(dailyDemand * 2.5);
    }

    // Add Noise 
    const noise = Math.floor(Math.random() * 3) - 1;
    dailyDemand = Math.max(0, dailyDemand + noise);

    // Create Discrete Orders
    for (let j = 0; j < dailyDemand; j++) {
      const orderTime = new Date(date);
      orderTime.setHours(Math.floor(Math.random() * 12) + 9); 

      // --- FIX 3: Generate Unique ID ---
      // Simple random string similar to uuid
      const uniqueId = `ORD-${Date.now()}-${Math.floor(Math.random()*10000)}`;

      ordersToInsert.push({
        order_id: uniqueId, // <--- Satisfies the Unique Index
        customer_id: 'SEED_BOT',
        items: [{
          product_sku: SKU,
          quantity: 1, 
          price: PRICE
        }],
        total_amount: PRICE,
        status: 'COMPLETED',
        createdAt: orderTime, // Backdating
        updatedAt: orderTime
      });
    }
  }

  if (ordersToInsert.length > 0) {
    await Order.insertMany(ordersToInsert);
    console.log(`✅ Successfully injected ${ordersToInsert.length} orders into Operational DB.`);
  } else {
    console.log("⚠️ No orders generated.");
  }

  await mongoose.disconnect();
};

generateOrders();