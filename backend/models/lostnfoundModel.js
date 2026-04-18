const mongoose = require("mongoose");
const { Schema } = mongoose;


const lostFoundSchema = new Schema(
    {   
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["Lost", "Found"],
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        contactInfo: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String, // optional: store image URL or file path
        },
        trainNumber: { type: String, required: true },
        status: {
            type: String,
            enum: ["Open", "Resolved"],
            default: "Open",
        },
    },
    { timestamps: true }
);

lostFoundSchema.index({ trainNumber: 1, createdAt: -1 });
lostFoundSchema.index({ userId: 1, trainNumber: 1, createdAt: -1 });
lostFoundSchema.index({ trainNumber: 1, category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("LostFound", lostFoundSchema);
