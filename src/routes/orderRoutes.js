const express = require("express");
const router = express.Router();

// 1. Fixed path (removed /orders/ and corrected file name)
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus 
} = require("../controllers/orderController");

// 2. Fixed middleware imports to match your actual files in sidebar
const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/requireAdmin"); 

// POST /api/orders — Convert cart to order
router.post("/", protect, createOrder);

// GET /api/orders — Current user's order history
router.get("/", protect, getOrders);

// GET /api/orders/:id — Single order
router.get("/:id", protect, getOrderById);

// PATCH /api/orders/:id/status — Admin only update
router.patch("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;