const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// 1. ADD ITEM TO CART (OR INCREMENT)
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        // Verify product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.stock < (quantity || 1)) return res.status(400).json({ message: "Not enough stock" });

        // Find user's cart or create one if it doesn't exist (upsert)
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [{ product: productId, quantity: quantity || 1 }] });
        } else {
            // Check if product is already in the cart
            const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

            if (itemIndex > -1) {
                // If exists, increment quantity
                cart.items[itemIndex].quantity += (quantity || 1);
            } else {
                // If new, push to items array
                cart.items.push({ product: productId, quantity: quantity || 1 });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// 2. GET USER CART
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price imageUrl');
        if (!cart) return res.status(200).json({ items: [] });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};