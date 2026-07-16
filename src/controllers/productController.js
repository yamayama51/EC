
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ユーザー商品系処理のリクエストを受け取り結果を返す
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const ProductService = require('../services/productService');
const ReviewService = require('../services/reviewService');

const catchAsync = require('../helpers/catchAsync');

// 商品一覧の表示
module.exports.index = catchAsync(async (req, res) => {

    // req.paramsからクエリの作成
    const searchOptions = {
        isActive: true,
        categoryName: req.query.category,
        page: req.query.page
    }

    // クエリを渡し表示オブジェクトを取得
    const result = await ProductService.getProductsList(searchOptions);

    res.render('products/index',
        {
            // 商品一覧画面に使用
            products: result.products,
            categoryName: result.categoryName,

            // ページング画面で使用
            pagination: result.pagination,
            queryParams: result.queryParams,
            baseUrl: 'products'
        }
    );
});

// 商品詳細画面表示
module.exports.renderShowForm = catchAsync(async (req, res) => {

    const { id } = req.params;
    const { size } = req.query;

    // 商品情報を取得
    const { product, variants, selectedVariant } = await ProductService.getProductDetail(id, size);

    // エラー処理
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/products');
    }
    if (!variants) {
        req.flash('error', '商品バリエーションが見つかりませんでした');
        return res.redirect('/products');
    }

    // レビューの書き込み権限を取得
    const canWriteReview = req.user
        ? await ReviewService.canUserWriteReview(req.user._id, variants, id)
        : false
    ;

    res.render('products/show', 
        {
            product, 
            variants, 
            selectedVariant, 
            canWriteReview 
        }
    );
});