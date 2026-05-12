
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const cart = require('../controllers/cart');
const { userSchema } = require('../schemas/schemas');

const { validate, isLoggedIn } = require('../middlewares/middlewares');
const catchAsync = require('../helpers/catchAsync');

router.route('/')
    .get(isLoggedIn, catchAsync(cart.index))
    .post(isLoggedIn, catchAsync(cart.addToCart))

router.route('/:productId/add')
    .patch(isLoggedIn, catchAsync(cart.addQuantity))

router.route('/:productId/reduce')
    .patch(isLoggedIn, catchAsync(cart.reduceQuantity))

router.route('/:productId/delete')
    .patch(isLoggedIn, catchAsync(cart.deleteOne))

module.exports = router;