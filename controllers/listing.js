const Listings = require('../models/listings.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const perPage = 12;
    const page = parseInt(req.query.page) || 1;
    const filter = req.query.filter || 'all';
    const search = req.query.search || '';

    try {
        let filterQuery = {};

        if (search) {
            filterQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } }
            ];
        }

        if (filter !== 'all') {
            if (filter === 'trending') {
                filterQuery.price = { $gte: 3000 };
            } else {
                filterQuery.category = filter.charAt(0).toUpperCase() + filter.slice(1);
            }
        }

        const totalListings = await Listings.countDocuments(filterQuery);

        const totalPages = Math.ceil(totalListings / perPage);

        const listings = await Listings.find(filterQuery)
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render("listings/listings.ejs", {
            listings,
            currentPage: page,
            totalPages,
            perPage,
            currentFilter: filter,
            searchQuery: search
        });
    } catch (err) {
        console.error("Error fetching listings:", err);
        req.flash("error", "Error loading listings");
        res.redirect("/");
    }
};

module.exports.newListing = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
    try {
        let response = await geocodingClient.forwardGeocode({
            query: `${req.body.listing.location}, ${req.body.listing.country}`,
            limit: 1,
        }).send();

        let url = req.file ? req.file.path : 'https://placehold.co/600x400?text=Image+Not+Found';
        let filename = req.file ? req.file.filename : 'default-listing';

        const category = req.body.listing?.category ||
            req.body['listing[category]'] ||
            req.body.category ||
            'Other';

        const newListing = new Listings({
            title: req.body.listing.title,
            description: req.body.listing.description,
            image: {
                url,
                filename
            },
            price: req.body.listing.price,
            location: req.body.listing.location,
            country: req.body.listing.country,
            category: category,
            geometry: response.body.features[0].geometry,
            owner: req.user._id
        });

        console.log("New listing object:", JSON.stringify(newListing, null, 2));

        await newListing.save();
        req.flash("success", "New Listing Added!");
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error("Error creating listing:", err);
        console.error("Error details:", err.message);
        req.flash("error", "Failed to create listing");
        res.redirect("/listings/new");
    }
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listings.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload", "/upload/h_200");


    res.render("./listings/edit.ejs", { listing, originalImage });
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listings.findById(id).populate({
        path: "reviews", populate: {
            path: "author",
        },
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;

        const originalListing = await Listings.findById(id);
        const newLocation = req.body.listing.location;
        const newCountry = req.body.listing.country;

        if (originalListing.location !== newLocation || originalListing.country !== newCountry) {
            const response = await geocodingClient.forwardGeocode({
                query: `${newLocation}, ${newCountry}`,
                limit: 1,
            }).send();

            if (response && response.body && response.body.features && response.body.features.length > 0) {
                req.body.listing.geometry = response.body.features[0].geometry;
            } else {
                console.log("Geocoding failed for the updated location");
            }
        }

        const listing = await Listings.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        req.flash("success", "Successfully Updated Listing!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("Error updating listing:", err);
        req.flash("error", "Failed to update listing: " + err.message);
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listings.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully Deleted Listing!");
    res.redirect("/listings");
};