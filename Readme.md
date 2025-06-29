# HostHaven

Live Demo: https://hosthaven-w6l1.onrender.com

---

## Overview

HostHaven is a full-stack web application for property listings, bookings, and reviews. Built with Node.js, Express, MongoDB, and EJS, it enables users to browse, list, book, and review properties. The backend is robust, featuring authentication, session management, cloud image uploads, and comprehensive error handling.

---

## Features

- **Property Listings:** Create, edit, view, and delete property listings with images and details.
- **Booking System:** Book properties for specific dates and manage your bookings.
- **User Authentication:** Secure registration, login, and session management using Passport.js.
- **Review System:** Users can leave reviews and ratings for properties.
- **Cloudinary Integration:** Upload and manage listing images in the cloud.
- **Flash Messages:** User feedback for actions (success, error) using connect-flash.
- **Role-Based Access:** Only owners can edit/delete their listings; only review authors can edit/delete reviews.
- **RESTful Routing:** Clean, resource-oriented endpoints for all major resources.
- **Validation:** Joi-based schema validation for listings, reviews, and bookings.
- **Error Handling:** Centralized error handling with custom error classes.
- **Responsive UI:** EJS templates with layouts and partials for a consistent user experience.

---

## User Types

- **Guest:** Can browse listings, view details, and read reviews.
- **User (Authenticated):** Can create listings, book properties, write reviews, and manage their profile and bookings.
- **Owner:** Can edit or delete their own listings.

---

## Access Control

- **Public:** Home, listings, listing details, about, contact, login, signup.
- **User (Authenticated):** Create/edit/delete listings, book properties, write/edit/delete reviews, view profile and bookings.
- **Route Protection:** Enforced via Express middleware and Passport.js.

---

## Project Structure

```
HostHaven/
│
├── app.js                # Main Express app
├── cloudConfig.js        # Cloudinary configuration
├── middleware.js         # Custom middleware (auth, validation, etc.)
├── package.json          # Project metadata and dependencies
├── schema.js             # Joi validation schemas
│
├── controllers/          # Route controllers
│   ├── booking.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── init/                 # Database seeding and initialization
│   ├── data.js
│   └── index.js
│
├── models/               # Mongoose models
│   ├── bookings.js
│   ├── listings.js
│   ├── review.js
│   └── user.js
│
├── public/               # Static assets
│   ├── assets/
│   ├── css/
│   └── js/
│
├── routes/               # Express route definitions
│   ├── booking.js
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── uploads/              # Uploaded files (images, etc.)
│
├── utils/                # Utility functions and error classes
│   ├── ExpressError.js
│   └── wrapAsync.js
│
├── views/                # EJS templates
│   ├── error.ejs
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   ├── miscellenous/
│   └── users/
│
├── .env                  # Environment variables (not committed)
├── .gitignore            # Git ignore rules
└── Readme.md             # Project documentation
```

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB instance (local or cloud)

### 1. Clone the Repository

```sh
git clone https://github.com/Shreyanshu20/HostHaven
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following (see `.env` for example):

```
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_token
MONGO_URL=your_mongodb_uri
SECRET=your_session_secret
```

### 4. Run the Application

```sh
node app.js
```

The server will start on [http://localhost:3000](http://localhost:3000).

---
---

## Contact

For questions or support, open an issue or contact the maintainer at [shreyanshudhawale2@gmail.com](mailto:shreyanshudhawale2@gmail.com).

---
