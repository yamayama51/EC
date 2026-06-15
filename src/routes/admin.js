
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者のルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const admin = require('../controllers/admin');
const { productSchema, categorySchema } = require('../schemas/schemas');

const { validate, isAdmin } = require('../middlewares/middlewares');
const catchAsync = require('../helpers/catchAsync');

// 全てのルートにisAdminを適用
router.use(isAdmin);

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 商品一覧
router.route('/products')
    .get(catchAsync(admin.productIndex))
    .post(upload.array('product[images]'), validate(productSchema), catchAsync(admin.createProduct))

// 商品新規登録
router.route('/products/new')
    .get(admin.renderProductNewForm)

// 商品詳細
router.route('/products/:id')
    .get(catchAsync(admin.renderShowForm))
    .put(upload.array('product[images]'), validate(productSchema), catchAsync(admin.updateProduct))
    .delete(catchAsync(admin.deleteProduct))

// 商品編集
router.route('/products/:id/edit')
    .get(catchAsync(admin.renderProductEditForm))


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 定数管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// カテゴリー一覧
router.route('/categories')
    .get(catchAsync(admin.categoryIndex))
    .post(validate(categorySchema), catchAsync(admin.createCategory))

// カテゴリー詳細
router.route('/categories/:id')
    .put(validate(categorySchema), catchAsync(admin.updateCategory))
    .delete(catchAsync(admin.deleteCategory))

// カテゴリー編集
router.route('/categories/:id/edit')
    .get(catchAsync(admin.renderCategoryEditForm))


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 注文管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 注文一覧の取得
router.route('/orders')
    .get(catchAsync(admin.ordersIndex))

// 注文ステータスの変更
router.route('/orders/:orderId/update-status')
    .put(catchAsync(admin.updateOrderStatus))

module.exports = router;