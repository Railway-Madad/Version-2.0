const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainNumber: { type: String, required: true },
});

trainSchema.index({ trainNumber: 1 }, { unique: true });

module.exports = mongoose.model('Train', trainSchema);