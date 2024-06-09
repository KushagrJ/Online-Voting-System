const express = require("express");
const router = express.Router({ mergeParams: true });

const Vote = require("../models/vote");

const { is_logged_in, is_existing_poll, is_existing_vote, is_vote_voter,
    poll_is_ongoing } = require("../utils/middleware-functions");

router.post("/", is_logged_in, is_existing_poll, poll_is_ongoing,
    async (req, res, next) => {
        try {
            if (res.locals.poll.multiple_votes_allowed) {
                for (let i = 0; i < res.locals.poll.candidates.length; ++i) {
                    if (Object.hasOwn(req.body, `candidates-${i}`)) {
                        const vote = new Vote();
                        vote.voter = req.user._id;
                        vote.candidate = res.locals.poll.candidates[i]._id;

                        res.locals.poll.votes.push(vote);

                        await res.locals.poll.save();
                        await vote.save();
                    }
                }
            } else {
                const vote = new Vote();
                vote.voter = req.user._id;
                vote.candidate =
                    res.locals.poll.candidates[Number(req.body.candidate)]._id;

                res.locals.poll.votes.push(vote);

                await res.locals.poll.save();
                await vote.save();
            }

            req.flash("success", "Successfully submitted your vote!");
            res.redirect(`/polls/${req.params.id}`)
        } catch (err) {
            next(err);
        }
    }
);

router.delete("/:vote_id", is_logged_in, is_existing_poll, is_existing_vote,
    is_vote_voter, poll_is_ongoing, async (req, res, next) => {
        try {
            await Vote.findByIdAndDelete(req.params.vote_id);

            for (let i = res.locals.poll.votes.length - 1; i >= 0; --i) {
                if (!(await Vote.findById(poll.votes[i]))) {
                    poll.votes.splice(i, 1);
                }
            }

            await res.locals.poll.save();

            req.flash("success", "Successfully deleted the vote!");
            res.redirect(`/polls/${req.params.id}`);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
