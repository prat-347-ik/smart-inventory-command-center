// service-operational/src/routes/product.routes.js
import express from 'express';
import multer from 'multer';
import { 
  getProducts, 
  createProduct, 
  bulkUpload, 
  getProductBySku // <--- Import the new controller
} from '../controllers/product.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Routes
router.get('/', getProducts);
router.get('/:sku', getProductBySku); // <--- ADD THIS ROUTE
router.post('/', createProduct);

// The "Legacy Migration" endpoint
router.post('/upload', upload.single('file'), bulkUpload);

export default router;