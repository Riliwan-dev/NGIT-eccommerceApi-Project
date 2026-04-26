const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
      },
      quantity: { type: Number, required: true },
      priceAtPurchase: { type: Number, required: true } // REQUIRED by Task 05
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"], // Matches screenshot
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);