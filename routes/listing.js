const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

const listingController = require('../controllers/listing.js');

router.route("/")
    //Index Route
    .get(wrapAsync(listingController.index))
    //Create lisitng Route
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));


//new listing form route
router.get("/new", isLoggedIn, listingController.newListing);


router.route("/:id")
    //show listing route
    .get(wrapAsync(listingController.showListing))
    //update listing route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    //destroy listing route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


//edit listing form route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


module.exports = router;