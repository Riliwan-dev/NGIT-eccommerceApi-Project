const express = require("express");
const router = express.Router();

const {
  createOrder,
  paidOrder,
  getOrders,
} = require("../controllers/orderController");

// Middlewares
const authMiddleware = require("../middlewares/authMiddleware");

// Create Order
// POST /api/orders
router.post("/", authMiddleware, createOrder);

// Get User Orders
// GET /api/orders
router.get("/", authMiddleware, getOrders);

// Mark Order as Paid
// PATCH /api/orders/:id/pay
router.patch("/:id/pay", authMiddleware, paidOrder);

module.exports = router;