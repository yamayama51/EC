
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Reviewのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');
const { reviewSchema } = require('../schemas/schemas');

const { isLoggedIn, isReviewAuthor, validate } = require('../middlewares/middlewares');

// レビューの登録
router.route('/')
    .post(isLoggedIn, validate(reviewSchema), reviewController.createReview)

// レビューの編集・削除
router.route('/:reviewId')
     .delete(isLoggedIn, isReviewAuthor, reviewController.deleteReview)

module.exports = router;