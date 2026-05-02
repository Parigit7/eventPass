const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    type: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    remainingQuantity: { type: Number, required: true }
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String, required: true },
    description: { type: String, required: true },
    tickets: [ticketSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
