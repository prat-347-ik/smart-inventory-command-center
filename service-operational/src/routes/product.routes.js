import express from 'express';
import multer from 'multer';
import { 
  getProducts, 
  createProduct, 
  bulkUpload, 
  getProductBySku 
} from '../controllers/product.controller.js';
// 1. Import the Auth Middleware
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- Secured Routes ---
// All these now require a valid Bearer Token in the header

router.get('/', protect, getProducts);          // <--- Locked: No public scraping
router.get('/:sku', protect, getProductBySku);  // <--- Locked: Secure stock lookup
router.post('/', protect, createProduct);       // <--- Locked: Only staff can add items

// The "Legacy Migration" endpoint
router.post('/upload', protect, upload.single('file'), bulkUpload); // <--- Locked

export default router;