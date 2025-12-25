import Product from '../models/Product.model.js';

export const getAllProductsService = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

export const createProductService = async (productData) => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};

export const getProductBySkuService = async (sku) => {
  // Case-insensitive search
  return await Product.findOne({ 
    sku: { $regex: new RegExp(`^${sku}$`, 'i') } 
  });
};

