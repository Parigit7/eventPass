const Booking = require('../models/Booking');
const Event = require('../models/Event');
const crypto = require('crypto');

// Generate 12-character unique ID
const generateBookingId = () => {
    return crypto.randomBytes(6).toString('hex').toUpperCase(); // 12 characters
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { eventId, tickets, totalPrice } = req.body;

        if (!tickets || tickets.length === 0) {
            return res.status(400).json({ error: 'Please select at least one ticket' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 1. Check and update ticket quantities
        for (const selectedTicket of tickets) {
            const eventTicket = event.tickets.find(t => t.type === selectedTicket.type);
            
            if (!eventTicket) {
                return res.status(400).json({ error: `Ticket type ${selectedTicket.type} not found for this event` });
            }

            if (eventTicket.remainingQuantity < selectedTicket.quantity) {
                return res.status(400).json({ error: `Not enough tickets available for ${selectedTicket.type}` });
            }

            // Reduce remaining quantity
            eventTicket.remainingQuantity -= selectedTicket.quantity;
        }

        // 2. Save the updated event
        await event.save();

        // 3. Create the booking
        const booking = await Booking.create({
            user: req.user.id,
            event: eventId,
            bookingId: generateBookingId(),
            tickets,
            totalPrice
        });

        res.status(201).json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('event', 'title date location image')
            .sort('-createdAt');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
