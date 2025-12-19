import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  const { items, userId } = req.body; // In a real app, userId comes from the auth token

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  try {
    let totalAmount = 0;
    const orderItems = [];

    // 1. Validate Items & Calculate Total
    for (const item of items) {
      const product = await Product.findOne({ sku: item.sku });
      
      if (!product) {
        throw new Error(`Product not found: ${item.sku}`);
      }
      if (product.current_stock < item.qty) {
        throw new Error(`Insufficient stock for: ${product.name}`);
      }

      // Add to order array with PRICE SNAPSHOT
      orderItems.push({
        product_id: product._id,
        qty: item.qty,
        price_at_sale: product.price
      });

      totalAmount += product.price * item.qty;

      // 2. Deduct Stock (Inventory Management)
      product.current_stock -= item.qty;
      await product.save();
    }

    // 3. Create Order
    const order = new Order({
      order_id: `ORD-${Date.now()}`, // Simple unique ID generator
      placed_by: userId, // We will manually pass this for MVP testing
      items: orderItems,
      total_amount: totalAmount,
      status: 'COMPLETED'
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    // Populate shows the actual Name/Email instead of just ID
    const orders = await Order.find()
      .populate('placed_by', 'username email')
      .populate('items.product_id', 'name sku');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};