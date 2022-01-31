const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    imageUrl: { type: String },
    groupId: { type: String, required: true },
    email: { type: String, required: true }
});

module.exports = mongoose.model('Card', cardSchema);