
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const order = require('../controllers/order');
const { orderSchema } = require('../schemas/schemas');

const { isLoggedIn } = require('../middlewares/middlewares');

router.route('/')
    .get(isLoggedIn, order.index)
    .post(isLoggedIn, order.createOrder)

router.route('/success')
    .get(isLoggedIn, order.renderSuccessForm)

router.route('/:id')
    .get(isLoggedIn, order.renderShowForm)

module.exports = router;