import Product from '../models/Product.model.js';

export const getAllProductsService = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

export const createProductService = async (productData) => {
  // 1. Performance Fix: Force SKU to Uppercase
  // This ensures data consistency and allows fast exact-match lookups later.
  if (productData.sku) {
    productData.sku = productData.sku.toUpperCase();
  }

  const newProduct = new Product(productData);
  return await newProduct.save();
};

export const getProductBySkuService = async (sku) => {
  // 2. Performance Fix: Use Exact Match instead of Regex
  // MongoDB uses the B-Tree index directly for exact matches (fast).
  // Regex usually forces a scan (slow).
  return await Product.findOne({ 
    sku: sku.toUpperCase() 
  });
};