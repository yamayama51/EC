
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { isLoggedIn } = require('../middlewares/middlewares');

router.route('/')
    .get(isLoggedIn, cartController.index)
    .post(isLoggedIn, cartController.addToCart)

router.route('/:variantId/add')
    .patch(isLoggedIn, cartController.addQuantity)

router.route('/:variantId/reduce')
    .patch(isLoggedIn, cartController.reduceQuantity)

router.route('/:variantId/delete')
    .patch(isLoggedIn, cartController.deleteOne)

module.exports = router;