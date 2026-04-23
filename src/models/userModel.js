const mongoose = require('mongoose');

// This defines the structure of our User data
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // This ensures no two users have the same email
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    }
}, { 
    timestamps: true // This automatically creates the 'createdAt' and 'updatedAt' fields
});

// We export the model so we can use it in our Controller later
module.exports = mongoose.model('User', userSchema);