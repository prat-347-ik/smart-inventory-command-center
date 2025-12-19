import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // <--- NEW: Import HTTP module
import { Server } from 'socket.io';  // <--- NEW: Import Socket.io

import connectDB from './config/db.js';
import logger from './utils/logger.js';
import errorHandler from './middlewares/error.middleware.js';

// Import Routes
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import authRoutes from './routes/auth.routes.js';

// Import Socket Logic
import { inventorySocket } from './sockets/inventory.socket.js';

const app = express();
const httpServer = createServer(app); // <--- NEW: Wrap Express
const io = new Server(httpServer, {   // <--- NEW: Init Socket.io
  cors: {
    origin: "*", // Allow React Frontend to connect
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make 'io' accessible in routes (so we can emit events from controllers)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database Connection
await connectDB();

// Initialize Socket Logic
inventorySocket(io);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Service A (Operational) is running correctly' });
});

// Global Error Handler (Must be last)
app.use(errorHandler);

// Start Server (Use httpServer.listen, NOT app.listen)
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  logger.info(`Operational Service running on http://localhost:${PORT}`);
  logger.info(`Socket.io Server is active`);
});