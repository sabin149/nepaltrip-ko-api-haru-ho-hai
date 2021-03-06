const router = require('express').Router();
const reviewCtrl = require('../controllers/reviewCtrl');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/auth-admin');

router.get('/review', auth, reviewCtrl.getReviews);
router.get('/review/:id', auth, reviewCtrl.getReviewsByHotel);
router.post("/review", auth, reviewCtrl.createReview)
router.patch("/review/:id", auth, reviewCtrl.updateReview)
router.delete("/review/:id", auth, reviewCtrl.deleteReview)
router.patch("/review/:id/like", auth, reviewCtrl.likeReview)
router.patch("/review/:id/unLike", auth, reviewCtrl.unLikeReview)
router.patch("/rating", auth, reviewCtrl.createRating)

module.exports = router;
