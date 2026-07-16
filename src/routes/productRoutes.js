
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Productのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

// 商品一覧
router.route('/')
    .get(productController.index)

// 商品詳細
router.route('/:id')
    .get(productController.renderShowForm)

module.exports = router;