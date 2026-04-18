const mongoose = require('mongoose');
const { email } = require('zod');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    trainNo: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

adminSchema.index({ role: 1, createdAt: -1 });
adminSchema.index({ trainNo: 1, role: 1, createdAt: -1 });

module.exports = mongoose.model('Admin', adminSchema);
