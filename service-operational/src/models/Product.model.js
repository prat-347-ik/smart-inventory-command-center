import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  current_stock: { type: Number, default: 0 },
  low_stock_threshold: { type: Number, default: 10 },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);