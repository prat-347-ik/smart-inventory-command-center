// service-operational/src/services/order.service.js
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';

/**
 * Handles the business logic for creating an order:
 * 1. Validates stock
 * 2. Calculates totals
 * 3. Deducts inventory
 * 4. Creates the order record
 */
export const createOrderService = async (userId, items) => {
  let totalAmount = 0;
  const orderItems = [];

  // Loop through items to validate stock and prepare data
  for (const item of items) {
    const product = await Product.findOne({ sku: item.sku });

    if (!product) {
      throw new Error(`Product not found: ${item.sku}`);
    }
    if (product.current_stock < item.qty) {
      throw new Error(`Insufficient stock for: ${product.name}`);
    }

    // Snapshot price at the moment of sale
    orderItems.push({
      product_id: product._id,
      qty: item.qty,
      price_at_sale: product.price
    });

    totalAmount += product.price * item.qty;

    // Deduct Stock (Critical Step)
    product.current_stock -= item.qty;
    await product.save();
  }

  // Create and return the order
  const order = await Order.create({
    order_id: `ORD-${Date.now()}`,
    placed_by: userId,
    items: orderItems,
    total_amount: totalAmount,
    status: 'COMPLETED'
  });

  return order;
};