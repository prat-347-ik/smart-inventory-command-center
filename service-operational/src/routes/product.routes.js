// service-operational/src/routes/product.routes.js
import express from 'express';
import multer from 'multer';
import { 
  getProducts, 
  createProduct, 
  bulkUpload, 
  getProductBySku,
  updateProduct, // <--- Import
  deleteProduct  // <--- Import
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 
import { authorize } from '../middlewares/role.middleware.js'; // <--- Import

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 1. PUBLIC / SHARED ROUTES
router.get('/', protect, getProducts);
router.get('/:sku', protect, getProductBySku);

// 2. STAFF & ADMIN (Operational)
// Staff can update stock counts
router.put('/:sku', protect, authorize('ADMIN', 'STAFF'), updateProduct); 

// 3. ADMIN ONLY (Catalog Management)
router.post('/', protect, authorize('ADMIN'), createProduct);       
router.post('/upload', protect, authorize('ADMIN'), upload.single('file'), bulkUpload); 
router.delete('/:sku', protect, authorize('ADMIN'), deleteProduct); 

export default router;