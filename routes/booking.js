const express = require('express');
const router = express.Router({ mergeParams: true });
const bookings = require('../controllers/booking.js');
const { isLoggedIn } = require('../middleware.js');
const wrapAsync = require('../utils/wrapAsync.js');

// View all user bookings
router.get("/my-bookings", isLoggedIn, wrapAsync(bookings.getUserBookings));

// Create a booking
router.post('/listings/:id/book', isLoggedIn, bookings.createBooking);

// Cancel booking
router.patch("/bookings/:id/cancel", isLoggedIn, bookings.cancelBooking);

// dsable unavailable dates
router.get('/listings/:id/unavailable-dates', bookings.getUnavailableDates);

module.exports = router;