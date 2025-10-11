const mongoose = require('mongoose');

const VALID_ISSUE_DOMAINS = [
    'Cleaning',
    'Catering',
    'Security',
    'Maintenance',
    'Medical'
];

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
   username: {
        type: String,
        required: true,
        trim: true
    },
    pnr: {
        type: String,
        required: true,
        trim: true
    },
    bogieNumber:{
        type: String,
        required: true,
        trim: true
    },
    seatNumber: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    issueDomain: {
        type: String,
        required: true,
        enum: VALID_ISSUE_DOMAINS,
        default: 'Maintenance'
    },
    linkurl: {
        type: String,
        default: null // Cloudinary image URL, null if no image
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved','Important'],
        default: 'Pending'
    },
    resolutionDetails: {
        type: String,
        default: ''
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: Date
});

module.exports = mongoose.model('Complaint', complaintSchema);