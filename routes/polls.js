const express = require("express");
const router = express.Router();

const Poll = require("../models/poll");
const User = require("../models/user");

const { is_logged_in, is_existing_poll, is_poll_organiser } =
    require("../utils/middleware-functions");

const multer = require("multer");
const { storage } = require("../utils/multer-and-cloudinary");
const upload = multer({ storage });

router.get("/new", is_logged_in, async (req, res, next) => {
    try {
        let voters = await User.find({}).distinct("username");
        voters = voters.filter(item => item !== req.user.username);

        res.render("polls/new", {
            initial_candidates: 0, initial_voters: 0, voters
        });
    } catch (err) {
        next(err);
    }
});

router.post("/", is_logged_in, upload.any(), async (req, res, next) => {
    try {
        const poll = new Poll(req.body.poll);

        poll.concluded = false;
        poll.organiser = req.user._id;
        poll.candidates = req.body.candidates;

        poll.multiple_votes_allowed =
            Object.hasOwn(req.body, "multiple-votes-allowed");
        poll.organiser_can_vote =
            Object.hasOwn(req.body, "organiser-can-vote");
        poll.ongoing_poll_results_visible =
            Object.hasOwn(req.body, "ongoing-poll-results-visible");
        poll.anonymous_votes =
            Object.hasOwn(req.body, "anonymous-votes");

        poll.anyone_can_vote =
            Object.hasOwn(req.body, "anyone-can-vote");

        if (!(poll.anyone_can_vote)) {
            for (voter_username of req.body.voters) {
                const voter = await User.findOne({ username: voter_username });
                poll.voters.push(voter._id);
            }
        }

        for (image of req.files) {
            if (image.fieldname === "poll-images") {
                poll.images.push({
                    url: image.path, file_name: image.filename
                });
            } else {
                const substrings = image.fieldname.split("-");
                const index = Number(substrings[1]);
                poll.candidates[index].images.push({
                    url: image.path, file_name: image.filename
                });
            }
        }

        await poll.save();

        req.flash("success", "Successfully created a new poll!");
        res.redirect(`/polls/${poll._id}`);
    } catch (err) {
        next(err);
    }
});

router.get("/:id/edit", is_logged_in, is_existing_poll, is_poll_organiser,
    async (req, res, next) => {
        try {
            let voters = await User.find({}).distinct("username");
            voters = voters.filter(item => item !== req.user.username);

            res.render("polls/edit", { poll: res.locals.poll, voters });
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
