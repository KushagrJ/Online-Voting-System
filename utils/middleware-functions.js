const ExpressError = require("../utils/express-error");

const Poll = require("../models/poll");
const Vote = require("../models/vote");

module.exports.is_logged_in = (req, res, next) => {
    if (!(req.isAuthenticated())) {
        req.session.return_to = req.originalUrl;

        req.flash("error", "You must be logged in!");
        res.redirect("/login");
    } else {
        next();
    }
};

module.exports.store_return_to = (req, res, next) => {
    if (req.session.return_to) {
        res.locals.return_to = req.session.return_to;
    }

    next();
};

module.exports.is_existing_poll = async (req, res, next) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            req.flash("error", "Couldn't find that poll!");
            res.redirect("/polls");
        } else {
            res.locals.poll = poll;
            next();
        }
    } catch (err) {
        next(err);
    }
};

module.exports.is_poll_organiser = (req, res, next) => {
    if ((!(req.user)) || (!(res.locals.poll)) ||
        (!(res.locals.poll.organiser.equals(req.user._id)))) {
        req.flash("error", "You do not have permission to do that!");
        res.redirect(`/polls/${res.locals.poll._id}`);
    } else {
        next();
    }
};

module.exports.is_existing_vote = async (req, res, next) => {
    try {
        const vote = await Vote.findById(req.params.vote_id);

        if (!vote) {
            req.flash("error", "Couldn't find that vote!");
            res.redirect("/polls");
        } else {
            res.locals.vote = vote;
            next();
        }
    } catch (err) {
        next(err);
    }
};

module.exports.is_vote_voter = (req, res, next) => {
    if ((!(req.user)) || (!(res.locals.vote)) ||
        (!(res.locals.vote.voter.equals(req.user._id)))) {
        res.flash("error", "You do not have permission to do that!");
        res.redirect(`/polls/${res.locals.poll._id}`);
    } else {
        next();
    }
};
