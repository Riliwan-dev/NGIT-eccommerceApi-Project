const Product = require('../models/productModel');


// 1. GET ALL PRODUCTS (Public) - with category and search filters
exports.getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = {};

        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' }; // case-insensitive search

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// 2. GET SINGLE PRODUCT BY ID (Public)
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// 3. CREATE PRODUCT (Admin only)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, imageUrl } = req.body;
        
        const newProduct = new Product({
            name, description, price, category, stock, imageUrl
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};  

// 4. UPDATE PRODUCT (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, imageUrl } = req.body;
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, stock, imageUrl },
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

// 5. DELETE PRODUCT (Admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};