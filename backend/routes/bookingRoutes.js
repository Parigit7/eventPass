const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getMyBookings, 
    getAllBookings, 
    updateBookingStatus 
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);

// Admin Routes
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);

module.exports = router;
