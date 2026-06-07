
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者のルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const admin = require('../controllers/admin');
const { productSchema } = require('../schemas/schemas');

const { validate, isAdmin } = require('../middlewares/middlewares');
const catchAsync = require('../helpers/catchAsync');

// 全てのルートにisAdminを適用
router.use(isAdmin);

// 商品一覧
router.route('/products')
    .get(catchAsync(admin.index))
    .post(upload.array('product[images]'), validate(productSchema), catchAsync(admin.createProduct))

// 新規登録
router.route('/products/new')
    .get(admin.renderNewForm)

// 詳細
router.route('/products/:id')
    .get(catchAsync(admin.renderShowForm))
    .put(upload.array('product[images]'), validate(productSchema), catchAsync(admin.updateProduct))
    .delete(catchAsync(admin.deleteProduct))

// 編集
router.route('/products/:id/edit')
    .get(catchAsync(admin.renderEditForm))

module.exports = router;