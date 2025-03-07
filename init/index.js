const mongoose = require('mongoose');
const listingData = require('./data.js');
const Listing = require('../models/listings.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mapToken = process.env.MAP_TOKEN;

if (!mapToken) {
    console.error("ERROR: MAP_TOKEN is not defined in environment variables!");
    console.error("Please check your .env file in the project root directory.");
    process.exit(1); 
}

const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const MONGO_URL = "mongodb://localhost:27017/major_project";

main().then(() => {
    console.log("Connected to DB");
    initDB();
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

async function geocodeLocation(location, country) {
    try {
        const query = `${location}, ${country}`;
        const geoData = await geocodingClient
            .forwardGeocode({
                query,
                limit: 1,
            })
            .send();

        if (geoData && geoData.body && geoData.body.features && geoData.body.features.length > 0) {
            return geoData.body.features[0].geometry;
        } else {
            console.log(`No geocoding results found for ${query}`);
            return { type: "Point", coordinates: [0, 0] }; 
        }
    } catch (error) {
        console.error(`Error geocoding location ${location}, ${country}:`, error);
        return { type: "Point", coordinates: [0, 0] };
    }
}

function validateCategory(listing) {
    const validCategories = ['Beach', 'Mountain', 'City', 'Countryside', 'Cabin', 'Winter', 'Pool', 'Other'];

    if (listing.category && validCategories.includes(listing.category)) {
        return listing.category;
    }

    const lowerTitle = listing.title.toLowerCase();
    const lowerLocation = listing.location.toLowerCase();

    if (lowerTitle.includes('beach') || lowerLocation.includes('beach')) {
        return 'Beach';
    } else if (lowerTitle.includes('mountain') || lowerLocation.includes('mountain')) {
        return 'Mountain';
    } else if (lowerTitle.includes('city') || lowerLocation.includes('city')) {
        return 'City';
    } else if (lowerTitle.includes('countryside') || lowerTitle.includes('rural')) {
        return 'Countryside';
    } else if (lowerTitle.includes('cabin')) {
        return 'Cabin';
    } else if (lowerTitle.includes('winter') || lowerTitle.includes('snow')) {
        return 'Winter';
    } else if (lowerTitle.includes('pool')) {
        return 'Pool';
    } else {
        return 'Other';
    }
}

async function initDB() {
    try {
        const ownerId = '67c48c10197fee91e16b1622';

        await Listing.deleteMany({});
        console.log("Deleted all existing listings");

        console.log("Starting geocoding process...");
        const enhancedData = [];

        for (const listing of listingData.data) {
            const geometry = await geocodeLocation(listing.location, listing.country);
            const validatedCategory = validateCategory(listing);

            enhancedData.push({
                ...listing,
                owner: ownerId, 
                geometry: geometry,
                category: validatedCategory
            });

            console.log(`Processed: ${listing.location}, ${listing.country} - Category: ${validatedCategory}`);
        }

        console.log(`Finished processing ${enhancedData.length} listings, inserting into database...`);
        const insertedListings = await Listing.insertMany(enhancedData);
        console.log(`Successfully inserted ${insertedListings.length} listings with owner ID: ${ownerId}`);

    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        console.log("Database initialization complete, closing connection");
        mongoose.connection.close();
    }
}