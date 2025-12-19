// service-operational/src/controllers/order.controller.js
import { createOrderService } from '../services/order.service.js';
import { notifyStockUpdate } from '../sockets/inventory.socket.js'; // Using the socket utility
import Product from '../models/Product.model.js'; // Needed to fetch updated stock for the socket
import Order from '../models/Order.model.js'; // Needed for getOrders

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { items, userId } = req.body;

    // 1. Input Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // 2. Call the Service (Business Logic)
    const order = await createOrderService(userId, items);

    // 3. Real-Time Notification (Socket.io)
    // We loop through items to notify frontend of ALL changed products
    for (const item of items) {
      const updatedProduct = await Product.findOne({ sku: item.sku });
      // req.io comes from the middleware we added in server.js
      notifyStockUpdate(req.io, updatedProduct);
    }

    // 4. Send Response
    res.status(201).json(order);

  } catch (error) {
    // Pass to the global error handler middleware
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('placed_by', 'username email')
      .populate('items.product_id', 'name sku');
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
};