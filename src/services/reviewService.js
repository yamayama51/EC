
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | レビュー処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Order = require('../models/order');
const Review = require('../models/review');
const Product = require('../models/product');

// レビューの書き込み権限をチェックする
module.exports.canUserWriteReview = async (userId, variants, productId) => {

    // バリエーションIDをループする
    const variantIds = variants.map(v => v._id);

    // 購入済みかどうかを確認
    const hasPurchased = await Order.findOne({
        user: userId,
        'items.variantId': { $in: variantIds }
    });

    // レビューを投稿済みかを確認
    const hasReview = await Review.findOne({
        author: userId,
        product: productId
    });

    // 「購入済み」かつ「レビュー未投稿」なら投稿可能
    if (hasPurchased && !hasReview) {
        return true;
    }

    return false;
}

// レビューの作成
module.exports.createReview = async (userId, productId, reviewData) => {

    // URLから対象商品のIDを取得
    const product = await Product.findById(productId);

    // リクエストから入力内容を取得
    const review = new Review(reviewData);

    // レビューのユーザIDを設定
    review.author = userId;

    // レビューの商品IDを設定
    review.product = product._id;

    // 商品のレビューに追加
    product.reviews.push(review);

    // DBに登録
    await review.save();
    await product.save();

    return product;
}

// レビューの削除
module.exports.deleteReview = async (productId, reviewId) => {

    // レビューIDを対象の商品から削除
    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });

    // レビューの削除
    await Review.findByIdAndDelete(reviewId);
}