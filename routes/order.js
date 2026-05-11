
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const order = require('../controllers/order');
const { orderSchema } = require('../schemas/schemas');

const { isLogedIn } = require('../middlewares/middlewares');
const catchAsync = require('../helpers/catchAsync');

router.route('/')
    .post(isLogedIn, catchAsync(order.createOrder))

module.exports = router;