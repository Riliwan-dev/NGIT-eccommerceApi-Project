const express = require('express');
const router = express.Router();

// 1. Import the Chef (Controller) and the Guards (Middlewares)
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

// 2. PUBLIC ROUTES - Anyone can see products
router.get('/', getProducts);
router.get('/:id', getProductById);
// router.post('/', createProduct);

// 3. ADMIN ROUTES - Only logged-in Admins can create, update, delete products
// Notice how we put TWO guards at the door!
router.post('/', authMiddleware, requireAdmin, createProduct);
router.put('/:id', authMiddleware, requireAdmin, updateProduct);
router.delete('/:id', authMiddleware, requireAdmin, deleteProduct);

module.exports = router;
