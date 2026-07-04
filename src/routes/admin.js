
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者のルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const admin = require('../controllers/admin');
const { productSchema, categorySchema, productVariantSchema } = require('../schemas/schemas');

const { validate, isAdmin } = require('../middlewares/middlewares');

// 全てのルートにisAdminを適用
router.use(isAdmin);

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者ダッシュボード
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
router.route('/dashboard')
    .get(admin.dashboard)

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 商品一覧
router.route('/products')
    .get(admin.productIndex)
    .post(upload.array('product[images]'), validate(productSchema), admin.createProduct)

// 商品新規登録
router.route('/products/new')
    .get(admin.renderProductNewForm)

// 商品詳細
router.route('/products/:id')
    .put(upload.array('product[images]'), validate(productSchema), admin.updateProduct)
    .delete(admin.deleteProduct)

// 商品編集
router.route('/products/:id/edit')
    .get(admin.renderProductEditForm)

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品バリエーション管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// バリエーション一覧
router.route('/products/:id/variants')
    .get(admin.variantIndex)
    .post(validate(productVariantSchema), admin.createVariant)

// バリエーション詳細
router.route('/products/:id/variants/:variantId')
    .put(validate(productVariantSchema), admin.updateVariant)
    .delete(admin.deleteVariant)

// バリエーション編集
router.route('/products/:id/variants/:variantId/edit')
    .get(admin.renderVariantEditForm)

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 定数管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// カテゴリー一覧
router.route('/categories')
    .get(admin.categoryIndex)
    .post(validate(categorySchema), admin.createCategory)

// カテゴリー詳細
router.route('/categories/:id')
    .put(validate(categorySchema), admin.updateCategory)
    .delete(admin.deleteCategory)

// カテゴリー編集
router.route('/categories/:id/edit')
    .get(admin.renderCategoryEditForm)


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 注文管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 注文一覧の取得
router.route('/orders')
    .get(admin.ordersIndex)

// 注文ステータスの変更
router.route('/orders/:orderId/update-status')
    .put(admin.updateOrderStatus)

module.exports = router;