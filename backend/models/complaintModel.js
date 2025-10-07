const mongoose = require('mongoose');

const VALID_ISSUE_DOMAINS = [
    'Cleanliness',
    'Staff Behavior',
    'Catering',
    'Delay',
    'Facilities',
    'Other'
];

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueDomain: {
        type: String,
        enum: VALID_ISSUE_DOMAINS,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);