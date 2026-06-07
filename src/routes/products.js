
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Productのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const products = require('../controllers/products');

const catchAsync = require('../helpers/catchAsync');

// 商品一覧
router.route('/')
    .get(catchAsync(products.index))

// 商品詳細
router.route('/:id')
    .get(catchAsync(products.renderShowForm))

module.exports = router;