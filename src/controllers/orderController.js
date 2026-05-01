const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

/**
 * @desc Create Order
 * @route POST /api/orders
 */
const createOrder = async (req, res) => {
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find user cart
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Reduce stock safely
    for (const item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedProduct) {
        throw new Error(
          `Not enough stock for product ${item.product.name}`
        );
      }
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: userId,
          items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
          totalAmount,
          status: "pending",
        },
      ],
      { session }
    );

    // Clear cart
    await Cart.findOneAndDelete({ user: userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @desc Mark Order as Paid
 * @route PATCH /api/orders/:id/pay
 */
const paidOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = "paid";

    await order.save();

    res.status(200).json({
      message: "Order marked as paid",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @desc Get User Orders
 * @route GET /api/orders
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  paidOrder,
  getOrders,
};