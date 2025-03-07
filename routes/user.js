const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl, isLoggedIn } = require('../middleware.js');


const userController = require('../controllers/user.js');

router.route("/signup")
    //signup form route
    .get(userController.signupForm)

    //register route
    .post(wrapAsync(userController.register));


router.route("/login")
    //login form route
    .get(userController.loginForm)

    //login route
    .post(
        saveRedirectUrl,
        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
        userController.login);

//logout route
router.get("/logout", userController.logout);

router.route("/user/profile")
    //profile route
    .get(isLoggedIn, wrapAsync(userController.profile))

    //change username email route
    .put(isLoggedIn, wrapAsync(userController.updateProfile))

    // Delete account route
    .delete(isLoggedIn, wrapAsync(userController.ddestroyProfile));

// Change password route
router.put("/user/change-password", isLoggedIn, wrapAsync(userController.changePassword));

module.exports = router;