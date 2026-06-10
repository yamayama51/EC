
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { cloudinary } = require('../cloudinary');

const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const Review = require('../models/review');

const { generatePageRange } = require('../helpers/pagination');

// 商品一覧の表示
module.exports.index = async (req, res) => {
    
    // 指定されたページ番号・表示件数を定義
    const page = parseInt(req.query.page) || 1; 
    const limit = 20;

    // 検索条件を追加 (カテゴリーのフィルターを適用)
    const categoryName = req.query.category;
    let query = {};

    // カテゴリーのフィルターを適用
    if (categoryName) {

        // 名前からカテゴリーを検索
        const categoryDoc = await Category.findOne({ name: categoryName });

        // カテゴリーが存在すればIDで絞り込む
        if (categoryDoc) {
            query = { category: categoryDoc._id };
        } else {
            query = {};
        }
    }

    // 商品データの総数とページの総数を取得
    const totalProductsCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProductsCount / limit);

    // ページ数からlimit件分の商品データを取得
    const products = await Product.find(query).populate('category').skip((page - 1) * limit).limit(limit);

    // 表示するページを取得
    const finalDisplay = generatePageRange(page, totalPages);

    res.render('products/index',
        {
            products,
            categoryName,
            totalProductsCount,
            currentPage: page,
            from: (page - 1) * limit + 1,
            to: Math.min(page * limit, totalProductsCount),
            totalPages,
            finalDisplay 
        }
    );
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
    }).populate('category');

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