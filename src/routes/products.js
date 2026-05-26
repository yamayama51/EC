
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Productのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const products = require('../controllers/products');
const { productSchema } = require('../schemas/schemas');

const { validate, isAdmin } = require('../middlewares/middlewares');

const catchAsync = require('../helpers/catchAsync');

// 商品一覧
router.route('/')
    .get(catchAsync(products.index))
    .post(isAdmin, upload.array('product[images]'), validate(productSchema), catchAsync(products.createProduct))

// 新規登録画面
router.route('/new')
    .get(isAdmin, products.renderNewForm)

// 商品詳細
router.route('/:id')
    .get(catchAsync(products.renderShowForm))
    .put(isAdmin, upload.array('product[images]'), validate(productSchema), catchAsync(products.updateProduct))
    .delete(isAdmin, catchAsync(products.deleteProduct))

// 編集画面
router.route('/:id/edit')
    .get(isAdmin, catchAsync(products.renderEditForm))

module.exports = router;