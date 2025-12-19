import 'dotenv/config'; // Loads .env file
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import authRoutes from './routes/auth.routes.js';


// Initialize App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
await connectDB();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // <--- Add this
app.use('/api/auth', authRoutes);    // <--- Add this

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Service A (Operational) is running correctly' });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Operational Service running on http://localhost:${PORT}`);
});