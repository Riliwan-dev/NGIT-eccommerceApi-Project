const User = require('../models/userModel');

const requireAdmin = async (req, res, next) => {
    try {
        // 1. Get the user from the database using the ID from the token
        const user = await User.findById(req.user.id);

        // 2. Check if the user exists and if they are an 'admin'
        if (user && user.role === 'admin') {
            next(); // Success! They are an admin. Move to the controller.
        } else {
            res.status(403).json({ message: "Access Denied: Admin role required" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
};

module.exports = requireAdmin;