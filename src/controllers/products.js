
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { cloudinary } = require('../cloudinary');

const Product = require('../models/product');
const Variant = require('../models/productVariant');
const Category = require('../models/category');
const Order = require('../models/order');
const Review = require('../models/review');

const catchAsync = require('../helpers/catchAsync');
const { getPaginationData } = require('../helpers/pagination');

// 商品一覧の表示
module.exports.index = catchAsync(async (req, res) => {

    // 検索条件を追加 (カテゴリーのフィルターを適用)
    const categoryName = req.query.category;
    let query = { isActive: true };

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
    const totalItemsCount = await Product.countDocuments(query);

    // ページングに必要なデータを集める
    const pagination = getPaginationData(req.query.page, totalItemsCount);

    // DB検索
    // ページ数からlimit件分の商品データを取得
    const products = await Product.find(query)
        .populate('category')
        .skip((pagination.currentPage - 1) * pagination.LIMIT)
        .limit(pagination.LIMIT)
    ;

    res.render('products/index',
        {
            products,
            categoryName,
            pagination,
            baseUrl: 'products',
            queryParams: categoryName ? `&category=${encodeURIComponent(categoryName)}` : ''
        }
    );
});

// 商品詳細画面表示
module.exports.renderShowForm = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // クエリから選択中のサイズを探す
    const { size } = req.query;

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

    // 商品に紐づくバリエーションを取得
    const variants = await Variant.find({ product: product._id }).sort({ sizeOrder: 1 });
    if (!variants) {
        req.flash('error', '商品バリエーションが見つかりませんでした');
        return res.redirect('/products');
    }

    // 選択中のサイズを決定
    let selectedVariant = size 
        ? variants.find(v => v.size.toString() === size)
        : variants[0];

    // レビュー書込み権限があるかを確認
    let canWriteReview = false;

    // ログインしているかを確認
    if (req.user) {

        // バリエーションIDをループする
        const variantIds = variants.map(v => v._id);

        // 購入済みかどうかを確認
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            'items.variantId': { $in: variantIds }
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

    res.render('products/show', { product, variants, selectedVariant, canWriteReview });
});