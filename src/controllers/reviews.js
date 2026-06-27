
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | レビューのCRUD処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Review = require('../models/review');
const Product = require('../models/product');

const catchAsync = require('../helpers/catchAsync');

// レビューの登録
module.exports.createReview = catchAsync(async (req, res) => {

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // URLから対象商品のIDを取得
    const product = await Product.findById(req.params.productId);

    // リクエストから入力内容を取得
    const review = new Review(req.body.review);

    // レビューのユーザIDを設定
    review.author = userId;

    // レビューの商品IDを設定
    review.product = product._id;

    // 商品のレビューに追加
    product.reviews.push(review);

    // DBに登録
    await review.save();
    await product.save();

    req.flash('success', 'レビューを登録しました');

    res.redirect(`/products/${product._id}`);
});

// レビューの削除
module.exports.deleteReview = catchAsync(async (req, res) => {

    // 商品IDとレビューIDを取得
    const { productId, reviewId } = req.params;

    // レビューIDを対象の商品から削除
    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });

    // レビューの削除
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'レビューを削除しました');
    res.redirect(`/products/${productId}`);
});