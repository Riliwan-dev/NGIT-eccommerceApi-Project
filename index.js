const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 1. Load Environment Variables 
dotenv.config();

const app = express();

// 2. Middleware to handle JSON data
app.use(express.json());

// --- ROUTES ---
// Corrected paths: index.js and routes are in the same 'src' folder
app.use('/api/auth', require('./src/routes/userRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes')); 
app.use('/api/orders', require('./src/routes/orderRoutes'));


// 3. Task 01: Health Endpoint 
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// 4. Task 01: MongoDB Connection with Error Handling 
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1); 
    });

// 5. Start the Server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is active on port ${PORT}`);
});