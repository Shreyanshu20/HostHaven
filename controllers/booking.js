const Booking = require("../models/bookings");
const Listing = require("../models/listings");

// Check dates availability
module.exports.checkDatesAvailability = async (id, checkIn, checkOut) => {
    try {
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        const overlapping = await Booking.find({
            listing: id,
            status: { $ne: "canceled" },
            $or: [
                {
                    checkIn: { $lte: end },
                    checkOut: { $gte: start }
                }
            ]
        });

        return overlapping.length === 0;
    } catch (err) {
        console.error("Error checking availability:", err);
        return false;
    }
};

// Check availability 
module.exports.checkAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                available: false,
                error: "Please provide check-in and check-out dates"
            });
        }

        const isAvailable = await this.checkDatesAvailability(id, checkIn, checkOut);

        return res.json({ available: isAvailable });
    } catch (err) {
        console.error("Error checking availability:", err);
        return res.status(500).json({
            available: false,
            error: "Unable to check availability"
        });
    }
};

// Create booking
module.exports.createBooking = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Please login to make a booking"
            });
        }

        const { id } = req.params;
        const { checkIn, checkOut, guests, totalPrice, serviceFee } = req.body;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: "Listing not found"
            });
        }

        const isAvailable = await this.checkDatesAvailability(id, checkIn, checkOut);
        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                error: "The selected dates are not available"
            });
        }

        const booking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
            totalPrice,
            serviceFee,
            status: "confirmed"
        });

        await booking.save();

        return res.status(201).json({
            success: true,
            bookingId: booking._id,
            message: "Booking confirmed successfully!"
        });
    } catch (err) {
        console.error("Error creating booking:", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Error processing booking"
        });
    }
};

// Get user bookings
module.exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: "listing",
                select: "title location country image price"
            })
            .sort("-createdAt");

        res.render("users/bookings", { bookings });
    } catch (err) {
        console.error("Error getting bookings:", err);
        req.flash("error", "Unable to fetch your bookings");
        res.redirect("/listings");
    }
};

// Cancel booking
module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/my-bookings");
        }

        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "You don't have permission to cancel this booking");
            return res.redirect("/my-bookings");
        }

        booking.status = "canceled";
        await booking.save();

        req.flash("success", "Your booking has been successfully canceled");
        return res.redirect("/my-bookings");
    } catch (err) {
        console.error("Error canceling booking:", err);
        req.flash("error", "Error canceling your booking");
        return res.redirect("/my-bookings");
    }
};

module.exports.getUnavailableDates = async (req, res) => {
    try {
        const { id } = req.params;

        const bookings = await Booking.find({
            listing: id,
            status: { $ne: "canceled" }
        });

        const unavailableDates = [];

        bookings.forEach(booking => {
            const currentDate = new Date(booking.checkIn);
            const endDate = new Date(booking.checkOut);

            while (currentDate < endDate) {
                unavailableDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        res.json({ unavailableDates });
    } catch (err) {
        console.error("Error fetching unavailable dates:", err);
        res.status(500).json({ error: "Could not fetch unavailable dates" });
    }
};