const Review = require('../model/reviewModel');
const Hotel = require('../model/hotelModel');
const {APIfeatures} = require('../lib/features');

const reviewCtrl = {
    createReview: async (req, res) => {
        try {
            const { hotelId, review, tag, reply, hotelUserId } = req.body;

            const hotel = await Hotel.findById(hotelId);
            if (!hotel)
                return res.status(404).json({ status: "failed", msg: 'Hotel not found' });

            if (reply) {
                const review = await Review.findById(reply);
                if (!review)
                    return res.status(404).json({ status: "failed", msg: 'Review not found' });
            }

            const newReview = new Review({
                user: req.user._id,
                review,
                tag,
                reply,
                hotelId,
                hotelUserId
            })
            await Hotel.findOneAndUpdate(
                { _id: hotelId },
                { $push: { hotel_reviews: newReview._id } },
                { new: true }
            );

            await newReview.save();
            res.json({ status: "success", msg: 'Review created successfully', newReview });
        } catch (error) {
            res.status(500).json({ status: "failed", msg: error.message });
        }

    },
    updateReview: async (req, res) => {
        try {
            const { review } = req.body;

            await Review.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id

            }, { review })

            res.json({
                status: "success", msg: 'Review updated successfully',
                newReview: {
                    ...review.doc,
                    review
                }
            });
        } catch (error) {
            res.status(500).json({ status: "failed", msg: error.message });
        }

    },
    deleteReview: async (req, res) => {
        try {
            const review = await Review.findOneAndDelete({
                _id: req.params.id,
                $or: [
                    { user: req.user._id },
                    { hotelUserId: req.user._id }
                ]
            })
            if (!review)
                return res.status(404).json({ status: "failed", msg: 'Review not found' });
            await Hotel.findOneAndUpdate(
                {
                    _id: review.hotelId
                },
                { $pull: { hotel_reviews: req.params.id } })

            res.json({ status: "success", msg: 'Review deleted successfully' });

        } catch (error) {

        }
    },
    likeReview: async (req, res) => {
        try {
            const review = await Review.find({ _id: req.params.id, likes: req.user._id });

            if (review.length > 0)
                return res.status(404).json({ status: "failed", msg: 'You already liked this review' });

            await Review.findOneAndUpdate({ _id: req.params.id }, {
                $push: {
                    likes: req.user._id
                }
            }, { new: true })

            res.json({ status: "success", msg: 'Review liked successfully' });

        } catch (error) {
            res.status(500).json({ status: "failed", msg: error.message });
        }
    },
    unLikeReview: async (req, res) => {
        try {

            await Review.findOneAndUpdate({ _id: req.params.id }, {
                $pull: {
                    likes: req.user._id
                }
            }, { new: true })

            res.json({ status: "success", msg: 'Review unliked successfully' });

        } catch (error) {
            res.status(500).json({ status: "failed", msg: error.message });
        }

    },
    getReviews: async (req, res) => {
        try {
            const features = new APIfeatures(Review.find(), req.query).paginating().sorting().searching().filtering();

            const result = await Promise.allSettled([
                features.query,
                Review.countDocuments() // count number of hotels
            ])

            const reviews = result[0].status === "fulfilled" ? result[0].value : [];
            const count = result[1].status === "fulfilled" ? result[1].value : 0;
            // const hotels = await Hotel.find();
            res.json({ status: 'success', count, reviews });
        } catch (error) {
            res.status(500).json({ status: "failed", msg: error.message });
        }
    }
}
module.exports = reviewCtrl;