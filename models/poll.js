const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { cloudinary } = require("../utils/multer-and-cloudinary");

const PollSchema = new Schema({
    title: String,

    images: [
        {
            url: String,
            file_name: String
        }
    ],

    description: String,

    concluded: Boolean,

    candidates: [
        {
            title: String,

            images: [
                {
                    url: String,
                    file_name: String
                }
            ],

            description: String
        }
    ],

    multiple_votes_allowed: Boolean,
    organiser_can_vote: Boolean,
    ongoing_poll_results_visible: Boolean,
    anonymous_votes: Boolean,

    anyone_can_vote: Boolean,

    voters: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    votes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Vote"
        }
    ],

    organiser: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

const Vote = require("./vote");

PollSchema.post("findOneAndDelete", async function (poll) {
    if (poll) {
        await Vote.deleteMany({
            _id: {
                $in: poll.votes
            }
        });

        for (let image of poll.images) {
            await cloudinary.uploader.destroy(image.file_name, {
                invalidate: true
            });
        }

        for (let candidate of poll.candidates) {
            for (let image of candidate.images) {
                await cloudinary.uploader.destroy(image.file_name, {
                    invalidate: true
                });
            }
        }
    }
});

module.exports = mongoose.model("Poll", PollSchema);
