const Review = require('../models/review.js');
const Listings = require('../models/listings.js');

module.exports.createReview = async (req, res) => {
    let listing = await Listings.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview)

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
