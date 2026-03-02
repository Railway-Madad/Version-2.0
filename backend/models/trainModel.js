const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainNumber: { type: String, required: true },
});

module.exports = mongoose.model('Train', trainSchema);