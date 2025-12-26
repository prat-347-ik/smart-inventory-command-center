// service-operational/src/services/inventory.service.js
import Product from '../models/Product.model.js';

// UPDATED: Accept query params for search & filter
export const getAllProductsService = async (query = {}) => {
  const { search, category, limit, page } = query;
  
  let filter = {};
  
  // 1. Search Logic (Regex for Name or SKU)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // 2. Category Filter
  if (category && category !== 'All') {
    filter.category = category;
  }

  // 3. Execute Query
  return await Product.find(filter).sort({ createdAt: -1 });
};

export const createProductService = async (productData) => {
  if (productData.sku) productData.sku = productData.sku.toUpperCase();
  const newProduct = new Product(productData);
  return await newProduct.save();
};

export const getProductBySkuService = async (sku) => {
  return await Product.findOne({ sku: sku.toUpperCase() });
};

// [NEW] Update Product (Stock, Price, etc.)
export const updateProductService = async (sku, updateData) => {
  return await Product.findOneAndUpdate(
    { sku: sku.toUpperCase() },
    updateData,
    { new: true } // Return the updated document
  );
};

// [NEW] Delete Product
export const deleteProductService = async (sku) => {
  return await Product.findOneAndDelete({ sku: sku.toUpperCase() });
};