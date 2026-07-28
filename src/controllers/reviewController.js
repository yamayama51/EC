
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | レビューのCRUD処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const reviewService = require('../services/reviewService');

const Review = require('../models/review');
const Product = require('../models/product');

const catchAsync = require('../helpers/catchAsync');

// レビューの登録
module.exports.createReview = catchAsync(async (req, res) => {

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // 商品IDを取得
    const productId = req.params.productId;

    // レビューの作成
    const product = await reviewService.createReview(userId, productId, req.body.review);

    req.flash('success', 'レビューを登録しました');
    res.redirect(`/products/${product._id}`);
});

// レビューの削除
module.exports.deleteReview = catchAsync(async (req, res) => {

    // 商品IDとレビューIDを取得
    const { productId, reviewId } = req.params;

    // レビューの削除
    await reviewService.deleteReview(productId, reviewId);

    req.flash('success', 'レビューを削除しました');
    res.redirect(`/products/${productId}`);
});