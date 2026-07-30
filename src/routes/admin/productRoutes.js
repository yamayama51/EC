
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者の商品用ルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const multer = require('multer');
const { storage } = require('../../cloudinary');
const upload = multer({ storage });

const productController = require('../../controllers/admin/productController');
const { productSchema } = require('../../schemas/schemas');

const { validate } = require('../../middlewares/middlewares');

// 商品一覧
router.route('/')
    .get(productController.index)
    .post(upload.array('product[images]'), validate(productSchema), productController.createProduct)

// 商品新規登録
router.route('/new')
    .get(productController.renderNewForm)

// 商品詳細
router.route('/:id')
    .put(upload.array('product[images]'), validate(productSchema), productController.updateProduct)
    .delete(productController.deleteProduct)

// 商品編集
router.route('/:id/edit')
    .get(productController.renderEditForm)

module.exports = router;