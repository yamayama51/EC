
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Productのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const products = require('../controllers/products');

// 商品一覧
router.route('/')
    .get(products.index)

// 商品詳細
router.route('/:id')
    .get(products.renderShowForm)

module.exports = router;