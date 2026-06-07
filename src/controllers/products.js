
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { cloudinary } = require('../cloudinary');

const Product = require('../models/product');
const Order = require('../models/order');
const Review = require('../models/review');

// 商品一覧の表示
module.exports.index = async (req, res) => {
    
    // クエリストリングを取得
    const category = req.query._category;

    if (category) {

        // カテゴリーに一致する商品だけを取得する
        const products = await Product.find({ category: category });
        res.render('products/index', { products });
    } else {

        // DBから商品一覧を取得
        const products = await Product.find({});
        res.render('products/index', { products });
    }
};

// 商品詳細画面表示
module.exports.renderShowForm = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await Product.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });

    // 商品が見つからなければ一覧画面へ遷移
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/products');
    }

    // レビュー書込み権限があるかを確認
    let canWriteReview = false;

    // ログインしているかを確認
    if (req.user) {

        // 購入済みかどうかを確認
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            'items.productId': id
        });

        // レビューを投稿済みかを確認
        const hasReview = await Review.findOne({
            author: req.user._id,
            product: id
        });

        // 「購入済み」かつ「レビュー未投稿」なら投稿可能
        if (hasPurchased && !hasReview) {
            canWriteReview = true;
        }
    }

    res.render('products/show', { product, canWriteReview });
}