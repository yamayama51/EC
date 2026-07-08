
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const cart = require('../controllers/cart');
const { userSchema } = require('../schemas/schemas');

const { validate, isLoggedIn } = require('../middlewares/middlewares');

router.route('/')
    .get(isLoggedIn, cart.index)
    .post(isLoggedIn, cart.addToCart)

router.route('/:variantId/add')
    .patch(isLoggedIn, cart.addQuantity)

router.route('/:variantId/reduce')
    .patch(isLoggedIn, cart.reduceQuantity)

router.route('/:variantId/delete')
    .patch(isLoggedIn, cart.deleteOne)

module.exports = router;