require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const ejs_mate = require("ejs-mate");
const method_override = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const local_strategy = require("passport-local");

const User = require("./models/user");
const ExpressError = require("./utils/express-error");

const poll_routes = require("./routes/polls");
const vote_routes = require("./routes/votes");
const user_routes = require("./routes/users");

mongoose.connect("mongodb://127.0.0.1:27017/online-voting-system");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejs_mate);
app.use(express.urlencoded({ extended: true }));
app.use(method_override("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new local_strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.current_user = req.user;

    next();
});

app.use("/polls", poll_routes);
app.use("/polls/:id/votes", vote_routes);
app.use(user_routes);

app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;

    if (!(err.message)) {
        err.message = "Oh No, Something Went Wrong!";
    }

    res.status(statusCode);
    res.render("error", { err });
});

app.listen(3000, () => {
    console.log("Serving on port 3000!");
});
