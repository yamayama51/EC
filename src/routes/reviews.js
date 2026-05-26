
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Reviewのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews');
const { reviewSchema } = require('../schemas/schemas');

const { isLoggedIn, isReviewAuthor, validate } = require('../middlewares/middlewares');

const catchAsync = require('../helpers/catchAsync');

// レビューの登録
router.route('/')
    .post(isLoggedIn, validate(reviewSchema), catchAsync(reviews.createReview))

// レビューの編集・削除
router.route('/:reviewId')
     .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;