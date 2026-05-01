const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

// Correct folder name = middlewares
const authMiddleware = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");

// POST /api/orders
router.post("/", authMiddleware, createOrder);

// GET /api/orders
router.get("/", authMiddleware, getOrders);

// GET /api/orders/:id
router.get("/:id", authMiddleware, getOrderById);

// PATCH /api/orders/:id/status
router.patch(
  "/:id/status",
  authMiddleware,
  requireAdmin,
  updateOrderStatus
);

module.exports = router;