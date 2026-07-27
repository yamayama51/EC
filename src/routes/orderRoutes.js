
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { isLoggedIn } = require('../middlewares/middlewares');

router.route('/')
    .get(isLoggedIn, orderController.index)
    .post(isLoggedIn, orderController.createOrder)

router.route('/success')
    .get(isLoggedIn, orderController.renderSuccessForm)

router.route('/:id')
    .get(isLoggedIn, orderController.renderShowForm)

module.exports = router;