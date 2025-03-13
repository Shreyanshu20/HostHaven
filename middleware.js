const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema, bookingSchema } = require('./schema.js');
const Listing = require('./models/listings.js');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.validateListing = (req, res, next) => {
    const allowedFields = ['title', 'description', 'price', 'location', 'country', 'category'];

    if (req.body.listing && !req.body.listing.category) {
        req.body.listing.category = 'Other';
    }

    let { error } = listingSchema.validate(req.body);
    if (error) {
        console.log("Validation error:", error.details);
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};