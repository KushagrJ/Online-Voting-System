const express = require("express");
const router = express.Router();

const passport = require("passport");
const User = require("../models/user");

const { store_return_to } = require("../utils/middleware-functions");

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ username, email });
        const registered_user = await User.register(user, password);

        req.login(registered_user, err => {
            if (err) {
                next(err);
            } else {
                req.flash("success", "Successfully created a new user! " +
                    "Welcome to Online Voting System!");
                res.redirect("/polls");
            }
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/register");
    }
});

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", store_return_to,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }), (req, res) => {
        req.flash("success", "Successfully logged you in! " +
            "Welcome back to Online Voting System!");
        res.redirect(res.locals.return_to || "/polls");
    }
);

router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) {
            next(err);
        } else {
            req.flash("success", "Successfully logged you out!");
            res.redirect("/polls");
        }
    });
});

module.exports = router;
