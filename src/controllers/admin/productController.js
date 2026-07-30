
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者商品系処理のリクエストを受け取り結果を返す
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const productService = require('../../services/productService')
const productAdminService = require('../../services/admin/productService')

const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');


// 商品一覧表示
module.exports.index = catchAsync(async (req, res) => {

    // req.paramsからクエリの作成
    const searchOptions = {
        categoryName: req.query.category,
        page: req.query.page
    }

    // クエリを渡し表示オブジェクトを取得
    const result = await productService.getProductsList(searchOptions);

    res.render('admin/products/index',
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

// 商品登録画面表示
module.exports.renderNewForm = (req, res) => {

    res.render('admin/products/new');
}

// 商品編集画面表示
module.exports.renderEditForm = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await productService.getProductById(id, {
        populateCategory: true
    });
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/admin/products');
    }

    res.render('admin/products/edit', { product });
});

// 商品登録処理
module.exports.createProduct = catchAsync(async (req, res) => {

    logger.info(logMsg.ADMIN_PRODUCT.CREATE_SATRT,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username
        }
    );

    // 商品登録
    const { product, variant } = await productAdminService.createProduct(req.body.product, req.files);

    logger.info(logMsg.ADMIN_PRODUCT.CREATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: product._id,
            variantId: variant._id
        }
    );

    req.flash('success', '商品を登録しました');
    res.redirect(`/admin/products/${product._id}/edit`);
});

// 商品更新処理
module.exports.updateProduct = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    // let product = await Product.findById(id);

    logger.info(logMsg.ADMIN_PRODUCT.UPDATE_SATRT,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username,
            productId: id
         }
    );

    // 商品の更新
    const result = await productAdminService.updateProduct(id, req.body, req.files);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/admin/products');
    }

    logger.info(logMsg.ADMIN_PRODUCT.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: result.product._id 
        }
    );

    req.flash('success', '商品を更新しました');

    res.redirect('/admin/products');
});

// 商品削除処理
module.exports.deleteProduct = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    logger.info(logMsg.ADMIN_PRODUCT.DELETE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id 
        }
    );

    // 商品の削除
    const result = await productAdminService.deleteProduct(id);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/admin/products');
    }

    logger.info(logMsg.ADMIN_PRODUCT.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: result.product._id 
        }
    );

    req.flash('success', '商品を削除しました');
    res.redirect('/admin/products');
});