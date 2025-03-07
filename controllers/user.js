const User = require('../models/user.js');
const Listings = require('../models/listings.js');

module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to hostHaven!");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome Back to HostHaven!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};

module.exports.profile = async (req, res) => {
    const userListings = await Listings.find({ owner: req.user._id });
    res.render("users/profile.ejs", { listings: userListings });
};

module.exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, email } = req.body.user;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true, runValidators: true }
        );

        req.flash("success", "Profile updated successfully");

        return res.redirect("/user/profile");
    } catch (err) {
        req.flash("error", "Failed to update profile");

        return res.redirect("/user/profile");
    }
};

module.exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (newPassword !== confirmPassword) {
            req.flash("error", "New passwords don't match");
            return res.redirect("/user/profile");
        }

        const isValidPassword = await user.authenticate(currentPassword);
        if (!isValidPassword) {
            req.flash("error", "Current password is incorrect");
            return res.redirect("/user/profile");
        }

        user.setPassword(newPassword, async () => {
            await user.save();

            req.flash("success", "Password changed successfully");
            return res.redirect("/user/profile");
        });
    } catch (err) {
        req.flash("error", "Failed to change password");
        return res.redirect("/user/profile");
    }
};

module.exports.ddestroyProfile = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);

        const isValidPassword = await user.authenticate(password);
        if (!isValidPassword) {
            req.flash("error", "Password is incorrect");
            return res.redirect("/user/profile");
        }

        await Listings.deleteMany({ owner: userId });

        await User.findByIdAndDelete(userId);

        req.logout(function (err) {
            if (err) {
                req.flash("error", "Something went wrong while logging out");
                return res.redirect("/user/profile");
            }

            req.flash("success", "Your account has been successfully deleted");
            return res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", "Failed to delete account");
        return res.redirect("/user/profile");
    }
};