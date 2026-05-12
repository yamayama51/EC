
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
    .get(isLogedIn, catchAsync(order.index))
    .post(isLogedIn, catchAsync(order.createOrder))

router.route('/success')
    .get(isLogedIn, order.renderSuccessForm);

module.exports = router;