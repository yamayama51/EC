
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const cart = require('../controllers/cart');
const { userSchema } = require('../schemas/schemas');

const { validate, isLogedIn } = require('../middlewares/middlewares');
const catchAsync = require('../helpers/catchAsync');

router.route('/')
    .get(isLogedIn, catchAsync(cart.index))
    .post(isLogedIn, catchAsync(cart.addToCart))

router.route('/:productId/add')
    .patch(isLogedIn, catchAsync(cart.addQuantity))

router.route('/:productId/reduce')
    .patch(isLogedIn, catchAsync(cart.reduceQuantity))

router.route('/:productId/delete')
    .patch(isLogedIn, catchAsync(cart.deleteOne))

module.exports = router;