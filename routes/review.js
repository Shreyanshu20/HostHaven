const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware.js');

const reviewController = require('../controllers/review.js');

// Create a new review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Destroy a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;