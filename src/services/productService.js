
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ユーザー商品系処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Product = require('../models/product');
const Variant = require('../models/productVariant');

const { getPaginationData } = require('../helpers/pagination');

// 商品のリストを返す
module.exports.getProductsList = async (searchOptions) => {

    // クエリの作成 (必須条件をあらかじめ入れる)
    const query = { isActive: searchOptions.isActive };

    // カテゴリーでフィルターを適用
    if (searchOptions.categoryName) {
        const categoryDoc = await Category.findOne( { name: searchOptions.categoryName });

        // クエリにカテゴリー条件を追加
        query.category = categoryDoc ? categoryDoc._id : null;
    }

    // クエリを基に対象商品を取得

    // 商品データの総数とページの総数を取得
    const totalItemsCount = await Product.countDocuments(query);

    // ページングに必要なデータを集める
    const pagination = getPaginationData(searchOptions.page, totalItemsCount);

    // ページ数からlimit件分の商品データを取得
    const products = await Product.find(query)
        .populate('category')
        .skip((pagination.currentPage - 1) * pagination.LIMIT)
        .limit(pagination.LIMIT)
    ;

    return {
        products,
        categoryName: searchOptions.categoryName,
        pagination,
        queryParams: searchOptions.categoryName ? `&category=${encodeURIComponent(categoryName)}` : ''
    }
}

// 商品1件の詳細データを返す
module.exports.getProductDetail = async (id, size) => {

    // DBから商品を取得
    const product = await Product.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('category');

    if (!product) {
        return {
            product: null,
            variants: [],
            selectedVariant: null
        }
    }

    // 商品に紐づくバリエーションを取得
    const variants = await Variant.find({ product: product._id }).sort({ sizeOrder: 1 });

    // 選択中のサイズを決定
    let selectedVariant = size 
        ? variants.find(v => v.size.toString() === size)
        : variants[0];

    return {
        product,
        variants,
        selectedVariant
    }
}