const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const { createEvent, getEvents, updateEvent, deleteEvent, getStats } = require('../controllers/eventController');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Routes
router.post('/', protect, admin, upload.single('image'), createEvent);
router.get('/', getEvents);
router.get('/stats', protect, admin, getStats);
router.put('/:id', protect, admin, upload.single('image'), updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
