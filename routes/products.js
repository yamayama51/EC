
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Productのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const product = require('../controllers/products');
const { productSchema } = require('../schemas/schemas');

const { validate } = require('../middlewares/middlewares');
const { isAdmin } = require('../middlewares/middlewares');

const catchAsync = require('../helpers/catchAsync');

// 商品一覧
router.route('/')
    .get(catchAsync(product.index))
    .post(isAdmin, validate(productSchema), catchAsync(product.createProduct))

// 新規登録画面
router.route('/new')
    .get(isAdmin, product.renderNewForm)

// 商品詳細
router.route('/:id')
    .get(catchAsync(product.renderShowForm))
    .put(isAdmin, validate(productSchema), catchAsync(product.updateProduct))
    .delete(isAdmin, validate(productSchema), catchAsync(product.deleteProduct))

// 編集画面
router.route('/:id/edit')
    .get(isAdmin, catchAsync(product.renderEditForm))

module.exports = router;