import { getAllProductsService, createProductService } from '../services/inventory.service.js';
import { processCsvUpload } from '../services/csvIngestion.service.js';
import { notifyStockUpdate } from '../sockets/inventory.socket.js';

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const products = await getAllProductsService();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// @desc    Create single product
// @route   POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    // 1. Service Call
    const savedProduct = await createProductService(req.body);

    // 2. Socket Event (Notify Dashboard of new item)
    notifyStockUpdate(req.io, savedProduct);

    res.status(201).json(savedProduct);
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk Upload via CSV (Legacy Data Migration)
// @route   POST /api/products/upload
export const bulkUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1. Call the specialized CSV Service
    // We await the Promise we created in the service
    const count = await processCsvUpload(req.file.path);

    // 2. Response
    res.status(201).json({ 
      message: `Successfully imported ${count} products` 
    });

  } catch (error) {
    next(error);
  }
};