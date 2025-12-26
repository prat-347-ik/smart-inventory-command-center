import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios'; // <--- NEW: Import Axios for health check
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import logger from './utils/logger.js';
import errorHandler from './middlewares/error.middleware.js';

// Import Routes
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import authRoutes from './routes/auth.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Import Socket Logic
import { inventorySocket } from './sockets/inventory.socket.js';

const app = express();
const httpServer = createServer(app);

// --- 1. CORS CONFIGURATION (UPDATED FOR CLOUD) ---
const allowedOrigins = [
  'http://localhost:5173',               // Local React Development
  'http://localhost',                    // Docker Nginx
  process.env.FRONTEND_URL               // <--- CLOUD: Your Vercel URL (e.g., https://smart-inventory.vercel.app)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Critical for Cookies/Sessions
};

app.use(cors(corsOptions));
// --------------------------------------------------

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Apply same rules to WebSockets
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Make 'io' accessible in routes
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
app.use('/api/analytics', analyticsRoutes);

// Health Check (Service A)
app.get('/', (req, res) => {
  res.json({ status: 'Service A (Operational) is running correctly' });
});

// Global Error Handler
app.use(errorHandler);

// --- NEW FUNCTION: Check Python Connection ---
const checkAnalyticsConnection = async () => {
    // Use the same env var as your routes
    const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://service-analytics:8000';
    
    try {
        logger.info(`🔍 Checking connection to Analytics Service at ${analyticsUrl}...`);
        // Call the Python Health Endpoint
        const response = await axios.get(`${analyticsUrl}/health`, { timeout: 3000 });
        
        if (response.status === 200 && response.data.status === 'ok') {
            logger.info(`✅ Analytics Service is ONLINE and reachable.`);
        } else {
            logger.warn(`⚠️ Analytics Service responded but status is unexpected: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        // This log will appear RED/Error color if connection fails
        logger.error(`❌ Analytics Service is UNREACHABLE: ${error.message}`);
        logger.info(`   (If running locally, ensure Python server is up at localhost:8000)`);
        logger.info(`   (If in Docker, ensure container 'inventory-analytics' is running)`);
    }
};

// Start Server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, async () => {
  logger.info(`Operational Service running on http://localhost:${PORT}`);
  logger.info(`Socket.io Server is active`);
  
  // Trigger the check immediately on startup
  await checkAnalyticsConnection(); 
});