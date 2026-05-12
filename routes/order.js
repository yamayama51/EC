
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const order = require('../controllers/order');
const { orderSchema } = require('../schemas/schemas');

const { isLoggedIn } = require('../middlewares/middlewares');
const catchAsync = require('../helpers/catchAsync');

router.route('/')
    .get(isLoggedIn, catchAsync(order.index))
    .post(isLoggedIn, catchAsync(order.createOrder))

router.route('/success')
    .get(isLoggedIn, order.renderSuccessForm);

module.exports = router;