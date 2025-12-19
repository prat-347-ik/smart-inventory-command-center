import fs from 'fs';
import csv from 'csv-parser';
import Product from '../models/Product.model.js';

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create single product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Bulk Upload via CSV (Legacy Data Migration)
// @route   POST /api/products/upload
export const bulkUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Transform CSV data to match Schema
        // Assumes CSV headers: sku, name, category, price, current_stock
        const products = results.map(row => ({
            sku: row.sku,
            name: row.name,
            category: row.category,
            price: parseFloat(row.price),
            current_stock: parseInt(row.current_stock),
            low_stock_threshold: parseInt(row.low_stock_threshold || 10)
        }));

        await Product.insertMany(products);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.status(201).json({ message: `Successfully imported ${products.length} products` });
      } catch (error) {
        res.status(500).json({ message: 'Error importing data', error: error.message });
      }
    });
};