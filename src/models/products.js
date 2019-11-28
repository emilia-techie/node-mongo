var mongoose = require('mongoose')
ProductSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true, unique: true },
    productName: { type: String },
    productCategory: { type: String, enum: ["Indian", "Western"] },
    brand: { type: String },
    price: { type: String },
    colour: { type: String },
    size: { type: String },
    description: { type: String },
    ratings: { type: String },
    userComments: { type: String },
    isActive: { type: Number, enum: [1, 0], default: 1 },
    createdAt: { type: Date },
    updatedAt: { type: Date }
});

module.exports = mongoose.model('Product', ProductSchema);