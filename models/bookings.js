const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    serviceFee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "canceled"],
        default: "confirmed"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Validation: checkout date must be after checkin date
bookingSchema.path("checkOut").validate(function(value) {
    return this.checkIn < value;
}, "Check-out date must be after check-in date");

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;