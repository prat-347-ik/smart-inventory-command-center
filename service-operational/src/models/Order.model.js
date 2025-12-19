import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true }, // e.g., "ORD-2023-001"
  placed_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    price_at_sale: { type: Number, required: true } // Snapshot: Price might change later, but this stays fixed
  }],
  total_amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);