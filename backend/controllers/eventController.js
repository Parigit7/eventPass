const Event = require('../models/Event');

// Create Event
exports.createEvent = async (req, res) => {
    try {
        console.log('--- Create Event Request ---');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { title, date, time, location, description, tickets } = req.body;
        
        if (!title || !date || !location || !description) {
            return res.status(400).json({ error: 'Title, Date, Location, and Description are required' });
        }

        const eventDate = new Date(date);
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (eventDate < tomorrow) {
            return res.status(400).json({ error: 'Event date must be tomorrow or later' });
        }

        // Parse tickets if they come as string
        let parsedTickets = [];
        try {
            parsedTickets = typeof tickets === 'string' ? JSON.parse(tickets) : tickets;
            if (!Array.isArray(parsedTickets)) parsedTickets = [];
        } catch (e) {
            console.error('Ticket parsing failed:', e);
            return res.status(400).json({ error: 'Invalid tickets format' });
        }
        
        // Add remainingQuantity same as initial quantity
        const ticketsWithRemaining = parsedTickets.map(t => ({
            ...t,
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 0,
            remainingQuantity: Number(t.quantity) || 0
        }));

        const newEvent = new Event({
            title,
            date: new Date(date),
            time,
            location,
            description,
            tickets: ticketsWithRemaining,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            createdBy: req.user._id
        });

        await newEvent.save();
        console.log('Event Created Successfully:', newEvent._id);
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get Events (with filters)
exports.getEvents = async (req, res) => {
    try {
        const { search, type } = req.query; // type: 'active' or 'old'
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (type === 'active') {
            query.date = { $gt: today };
        } else if (type === 'old') {
            query.date = { $lte: today };
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Check if within 3 days of creation
        const diffTime = Math.abs(new Date() - event.createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (event.date <= today) {
            return res.status(403).json({ error: 'Cannot edit old events' });
        }

        if (diffDays > 3) {
            return res.status(403).json({ error: 'Editing window (3 days) has expired' });
        }

        const { title, date, time, location, description, tickets } = req.body;
        if (title) event.title = title;
        if (date) event.date = date;
        if (time) event.time = time;
        if (location) event.location = location;
        if (description) event.description = description;
        if (tickets) {
            const parsedTickets = typeof tickets === 'string' ? JSON.parse(tickets) : tickets;
            event.tickets = parsedTickets.map(t => ({
                ...t,
                remainingQuantity: t.quantity
            }));
        }
        if (req.file) event.image = `/uploads/${req.file.filename}`;

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const diffTime = Math.abs(new Date() - event.createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (event.date <= today) {
            return res.status(403).json({ error: 'Cannot delete old events' });
        }

        if (diffDays > 3) {
            return res.status(403).json({ error: 'Deletion window (3 days) has expired' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get Event Stats
exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeCount = await Event.countDocuments({ date: { $gte: today } });
        const pastCount = await Event.countDocuments({ date: { $lt: today } });

        res.json({
            activeEvents: activeCount,
            pastEvents: pastCount,
            totalBookings: 0 // Placeholder for now until bookings are implemented
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
