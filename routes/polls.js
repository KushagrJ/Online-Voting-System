const express = require("express");
const router = express.Router();

const Poll = require("../models/poll");
const User = require("../models/user");
const Vote = require("../models/vote");

const { is_logged_in, is_existing_poll, is_poll_organiser, poll_is_ongoing } =
    require("../utils/middleware-functions");

const multer = require("multer");
const { storage, cloudinary } = require("../utils/multer-and-cloudinary");
const upload = multer({ storage });

router.get("/", async (req, res, next) => {
    try {
        const polls = await Poll.find({});

        res.render("polls/index", {
            polls
        });
    } catch (err) {
        next(err);
    }
});

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

        let current_user_is_eligible = false;
        for (let voter of res.locals.poll.voters) {
            if (voter.equals(res.locals.current_user)) {
                current_user_is_eligible = true;
                break;
            }
        }

        let current_user_has_already_voted = false;
        for (let vote of res.locals.poll.votes) {
            if (vote.voter.equals(res.locals.current_user)) {
                current_user_has_already_voted = true;
                break;
            }
        }

        const current_user_voted_for = [];
        const current_user_voted_for_ids = [];
        for (let vote of res.locals.poll.votes) {
            if (vote.voter.equals(res.locals.current_user)) {
                for (let i = 0; i < res.locals.poll.candidates.length; ++i) {
                    if (res.locals.poll.candidates[i].equals(vote.candidate)) {
                        current_user_voted_for.push(i);
                        current_user_voted_for_ids.push(vote._id);
                    }
                }
            }
        }

        res.render("polls/show", {
            poll: res.locals.poll,
            current_user_is_eligible,
            current_user_has_already_voted,
            current_user_voted_for,
            current_user_voted_for_ids
        });
    } catch (err) {
        next(err);
    }
});

router.get("/:id/conclude", is_logged_in, is_existing_poll, is_poll_organiser,
    poll_is_ongoing, async (req, res, next) => {
        try {
            res.locals.poll.concluded = true;

            await res.locals.poll.save();

            req.flash("success", "Successfully concluded the poll!");
            res.redirect(`/polls/${res.locals.poll._id}`);
        } catch (err) {
            next(err);
        }
    }
);

router.get("/:id/edit", is_logged_in, is_existing_poll, is_poll_organiser,
    poll_is_ongoing, async (req, res, next) => {
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
    poll_is_ongoing, upload.any(), async (req, res, next) => {
        try {
            res.locals.poll.title = req.body.poll.title;
            res.locals.poll.description = req.body.poll.description;

            const multiple_votes_allowed =
                Object.hasOwn(req.body, "multiple-votes-allowed");
            if (multiple_votes_allowed !==
                res.locals.poll.multiple_votes_allowed) {
                await Vote.deleteMany({});
                res.locals.poll.votes = [];
            }
            res.locals.poll.multiple_votes_allowed = multiple_votes_allowed;

            res.locals.poll.organiser_can_vote =
                Object.hasOwn(req.body, "organiser-can-vote");
            if (!(res.locals.poll.organiser_can_vote)) {
                await Vote.deleteMany({
                    voter: res.locals.poll.organiser
                });

                for (let i = res.locals.poll.votes.length - 1; i >= 0; --i) {
                    if (!(await Vote.findById(res.locals.poll.votes[i]))) {
                        res.locals.poll.votes.splice(i, 1);
                    }
                }
            }

            res.locals.poll.ongoing_poll_results_visible =
                Object.hasOwn(req.body, "ongoing-poll-results-visible");
            res.locals.poll.anonymous_votes =
                Object.hasOwn(req.body, "anonymous-votes");

            res.locals.poll.anyone_can_vote =
                Object.hasOwn(req.body, "anyone-can-vote");

            for (let i = 0; i < res.locals.poll.candidates.length; ++i) {
                if (Object.hasOwn(req.body.candidates[i], "delete")) {
                    await Vote.deleteMany({
                        candidate: res.locals.poll.candidates[i]._id
                    });

                    for (let j = res.locals.poll.votes.length - 1;
                        j >= 0; --j) {
                        if (!(await Vote.findById(res.locals.poll.votes[j]))) {
                            res.locals.poll.votes.splice(j, 1);
                        }
                    }
                } else {
                    res.locals.poll.candidates[i].title =
                        req.body.candidates[i].title;
                    res.locals.poll.candidates[i].description =
                        req.body.candidates[i].description;
                }
            }

            for (let i = res.locals.poll.candidates.length;
                i < req.body.candidates.length; ++i) {
                res.locals.poll.candidates.push({
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
                for (image of res.locals.poll.images) {
                    await cloudinary.uploader.destroy(image.file_name, {
                        invalidate: true
                    });
                }

                res.locals.poll.images = poll_images;
            }

            for (let i = 0; i < req.body.candidates.length; ++i) {
                if (Object.hasOwn(req.body.candidates[i], "delete")) {
                    for (image of res.locals.poll.candidates[i].images) {
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
                        for (image of res.locals.poll.candidates[i].images) {
                            await cloudinary.uploader.destroy(image.file_name, {
                                invalidate: true
                            });
                        }

                        res.locals.poll.candidates[i].images =
                            candidates_images[i];
                    }
                }
            }

            res.locals.poll.voters = [];

            if (!(res.locals.poll.anyone_can_vote)) {
                for (let i = 0; i < req.body.voters.length; ++i) {
                    if (!(Object.hasOwn(req.body, `voters-${i}-delete`))) {
                        const voter = await User.findOne({
                            username: req.body.voters[i]
                        });

                        res.locals.poll.voters.push(voter._id);
                    }
                }

                if (res.locals.poll.organiser_can_vote) {
                    res.locals.poll.voters.push(res.locals.poll.organiser);
                }

                await Vote.deleteMany({
                    voter: {
                        $nin: res.locals.poll.voters
                    }
                });

                if (res.locals.poll.organiser_can_vote) {
                    res.locals.poll.voters.pop();
                }

                for (let i = res.locals.poll.votes.length - 1; i >= 0; --i) {
                    if (!(await Vote.findById(res.locals.poll.votes[i]))) {
                        res.locals.poll.votes.splice(i, 1);
                    }
                }
            }

            for (let i = res.locals.poll.candidates.length - 1; i >= 0; --i) {
                if (Object.hasOwn(req.body.candidates[i], "delete")) {
                    res.locals.poll.candidates.splice(i, 1);
                }
            }

            await res.locals.poll.save();

            req.flash("success", "Successfully updated the poll!");
            res.redirect(`/polls/${res.locals.poll._id}`);
        } catch (err) {
            next(err);
        }
    }
);

router.delete("/:id", is_logged_in, is_existing_poll, is_poll_organiser,
    async (req, res, next) => {
        try {
            await Poll.findByIdAndDelete(req.params.id);

            req.flash("success", "Successfully deleted the poll!");
            res.redirect("/polls");
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
