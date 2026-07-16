
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | レビュー処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Order = require('../models/order');
const Review = require('../models/review');

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