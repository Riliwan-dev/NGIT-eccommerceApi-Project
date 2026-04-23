const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Import the "Security Guard" file you just showed me
const authMiddleware = require('../middlewares/authMiddleware'); 

// This line tells Express: "Check the token for EVERY route below this line"
router.use(authMiddleware); 

// Now, these routes are PROTECTED
router.get('/', cartController.getCart);      // Get the user's cart
router.post('/', cartController.addToCart);   // Add item to cart

module.exports = router;