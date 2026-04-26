const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

/**
 * @desc    Create a new order from cart and deduct stock atomically
 * @route   POST /api/orders
 */
const createOrder = async (req, res) => {
  // 1. Start a Session for the Atomic Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    // 2. Fetch user's cart and populate product details
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 3. Loop through items to deduct stock ATOMICALLY
    for (const item of cart.items) {
      const quantityRequested = item.quantity;
      const productPrice = item.product.price;

      // HINT IMPLEMENTED: Use $inc with $gte to prevent negative stock
      const stockUpdate = await Product.findOneAndUpdate(
        { 
          _id: item.product._id, 
          stock: { $gte: quantityRequested } 
        },
        { 
          $inc: { stock: -quantityRequested } 
        },
        { session, new: true }
      );

      // If stockUpdate is null, the condition { stock: { $gte: qty } } failed
      if (!stockUpdate) {
        throw new Error(`Insufficient stock for product: ${item.product.name}`);
      }

      // Add to total and push to orderItems array (with snapshot of price)
      totalAmount += productPrice * quantityRequested;
      orderItems.push({
        product: item.product._id,
        quantity: quantityRequested,
        priceAtPurchase: productPrice // Required by Task 05
      });
    }

    // 4. Create the Order document
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    await order.save({ session });

    // 5. Clear the user's cart after successful order creation
    await Cart.findOneAndDelete({ user: userId }, { session });

    // 6. Commit the transaction — All changes saved to DB
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);

  } catch (error) {
    // 7. ROLLBACK: If any item fails (e.g., out of stock), undo everything
    await session.abortTransaction();
    session.endSession();
    
    res.status(400).json({ 
      message: error.message || "Order processing failed" 
    });
  }
};

/**
 * @desc    Get current user's order history
 * @route   GET /api/orders
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single order by ID (Ownership check required)
 * @route   GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Task Requirement: Must belong to requesting user (unless admin)
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Allowed statuses based on requirements
    const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};