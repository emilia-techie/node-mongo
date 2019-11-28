var mongoose = require('mongoose')
UsersSchema = new mongoose.Schema({
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    loginSessionKey: { type: String },
    tempCode: { type: Number },
    otpTimeLimit: { type: Date },
    isAccountVerified: { type: Number, enum: [0, 1], default: 1 }, //0 for not verified & 1 for verified
    accountStatus: { type: Number, enum: [0, 1], default: 1 }, // 0 for inactive & 1 for active
    createdAt: { type: Date },
    updatedAt: { type: Date }
});

module.exports = mongoose.model('User', UsersSchema);