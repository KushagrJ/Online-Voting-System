const express = require("express");
const router = express.Router();

const Poll = require("../models/poll");
const User = require("../models/user");
const Vote = require("../models/vote");

const { is_logged_in, is_existing_poll, is_poll_organiser } =
    require("../utils/middleware-functions");

const multer = require("multer");
const { storage, cloudinary } = require("../utils/multer-and-cloudinary");
const upload = multer({ storage });

router.get("/new", is_logged_in, async (req, res, next) => {
    try {
        let voters = await User.find({}).distinct("username");
        voters = voters.filter(item => item !== req.user.username);

        res.render("polls/new", {
            voters
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

        for (image of req.files) {
            if (image.fieldname === "poll-images") {
                poll.images.push({
                    url: image.path,
                    file_name: image.filename
                });
            } else {
                const substrings = image.fieldname.split("-");
                const index = Number(substrings[1]);
                poll.candidates[index].images.push({
                    url: image.path,
                    file_name: image.filename
                });
            }
        }

        if (!(poll.anyone_can_vote)) {
            for (voter_username of req.body.voters) {
                const voter = await User.findOne({
                    username: voter_username
                });

                poll.voters.push(voter._id);
            }
        }

        await poll.save();

        req.flash("success", "Successfully created a new poll!");
        res.redirect(`/polls/${poll._id}`);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", is_existing_poll, async (req, res, next) => {
    try {
        await res.locals.poll.populate("voters");

        await res.locals.poll.populate({
            path: "votes",
            populate: {
                path: "voter"
            }
        });

        await res.locals.poll.populate("organiser");

        res.render("polls/show", {
            poll: res.locals.poll
        });
    } catch (err) {
        next(err);
    }
});

router.get("/:id/edit", is_logged_in, is_existing_poll, is_poll_organiser,
    async (req, res, next) => {
        try {
            let voters = await User.find({}).distinct("username");
            voters = voters.filter(item => item !== req.user.username);

            await res.locals.poll.populate("voters");

            res.render("polls/edit", {
                poll: res.locals.poll,
                voters
            });
        } catch (err) {
            next(err);
        }
    }
);

router.put("/:id", is_logged_in, is_existing_poll, is_poll_organiser,
    upload.any(), async (req, res, next) => {
        try {
            const poll = await Poll.findOne({
                _id: req.params.id
            });

            poll.title = req.body.poll.title;
            poll.description = req.body.poll.description;

            const multiple_votes_allowed =
                Object.hasOwn(req.body, "multiple-votes-allowed");
            if (multiple_votes_allowed !== poll.multiple_votes_allowed) {
                Vote.deleteMany({});
            }
            poll.multiple_votes_allowed = multiple_votes_allowed;

            poll.organiser_can_vote =
                Object.hasOwn(req.body, "organiser-can-vote");
            if (!(poll.organiser_can_vote)) {
                Vote.deleteMany({
                    voter: poll.organiser
                });
            }

            poll.ongoing_poll_results_visible =
                Object.hasOwn(req.body, "ongoing-poll-results-visible");
            poll.anonymous_votes =
                Object.hasOwn(req.body, "anonymous-votes");

            poll.anyone_can_vote =
                Object.hasOwn(req.body, "anyone-can-vote");

            for (let i = 0; i < poll.candidates.length; ++i) {
                if (Object.hasOwn(req.body.candidates[i], "delete")) {
                    await Vote.deleteMany({
                        candidate: poll.candidates[i]._id
                    });
                } else {
                    poll.candidates[i].title = req.body.candidates[i].title;
                    poll.candidates[i].description =
                        req.body.candidates[i].description;
                }
            }

            for (let i = poll.candidates.length; i < req.body.candidates.length;
                ++i) {
                poll.candidates.push({
                    title: req.body.candidates[i].title,
                    description: req.body.candidates[i].description
                });
            }

            const poll_images = [];

            const candidates_images = [];
            for (let i = 0; i < req.body.candidates.length; ++i) {
                candidates_images.push([]);
            }

            for (image of req.files) {
                if (image.fieldname === "poll-images") {
                    poll_images.push({
                        url: image.path,
                        file_name: image.filename
                    });
                } else {
                    const substrings = image.fieldname.split("-");
                    const index = Number(substrings[1]);
                    candidates_images[index].push({
                        url: image.path,
                        file_name: image.filename
                    });
                }
            }

            if (poll_images.length > 0) {
                for (image of poll.images) {
                    await cloudinary.uploader.destroy(image.file_name, {
                        invalidate: true
                    });
                }

                poll.images = poll_images;
            }

            for (let i = 0; i < req.body.candidates.length; ++i) {
                if (Object.hasOwn(req.body.candidates[i], "delete")) {
                    for (image of poll.candidates[i].images) {
                        await cloudinary.uploader.destroy(image.file_name, {
                            invalidate: true
                        });
                    }

                    for (image of candidates_images[i]) {
                        await cloudinary.uploader.destroy(image.file_name, {
                            invalidate: true
                        });
                    }
                } else {
                    if (candidates_images[i].length > 0) {
                        for (image of poll.candidates[i].images) {
                            await cloudinary.uploader.destroy(image.file_name, {
                                invalidate: true
                            });
                        }

                        poll.candidates[i].images = candidates_images[i];
                    }
                }
            }

            poll.voters = [];

            if (!(poll.anyone_can_vote)) {
                for (let i = 0; i < req.body.voters.length; ++i) {
                    if (!(Object.hasOwn(req.body, `voters-${i}-delete`))) {
                        const voter = await User.findOne({
                            username: req.body.voters[i]
                        });

                        poll.voters.push(voter._id);
                    }
                }

                await Vote.deleteMany({
                    voter: {
                        $nin: poll.voters
                    }
                });
            }

            for (let i = poll.candidates.length - 1; i >= 0; --i) {
                if (Object.hasOwn(req.body.candidates[i], "delete")) {
                    poll.candidates.splice(i, 1);
                }
            }

            await poll.save();

            req.flash("success", "Successfully updated the poll!");
            res.redirect(`/polls/${poll._id}`);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
