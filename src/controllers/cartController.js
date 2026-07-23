
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カート系処理のリクエストを受け取り結果を返す
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Cart = require('../models/cart');
const cartService = require('../services/cartService');

const catchAsync = require('../helpers/catchAsync');

// カート画面表示
module.exports.index = catchAsync(async (req, res) => {

    // カート情報を取得
    const result = await cartService.getCartData(req.user._id);

    res.render('cart/index', { cart: result.cart, total: result.total });
});

// カートに追加
module.exports.addToCart = catchAsync(async (req, res) => {

    // 入力データを取得
    const { variantId, quantity, productId } = req.body.cart;

    // カート追加処理
    const result = await cartService.addToCart(req.user._id, variantId, quantity);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect(`/products/${productId}`);
    }

    res.redirect('/cart');
});

// カート内の数量を加算
module.exports.addQuantity = catchAsync(async (req, res) => {

    // URLから商品IDを取得
    const { variantId } = req.params;

    await cartService.addQuantity(req.user._id, variantId);
    res.redirect('/cart');
});

// カート内の数量を減算
module.exports.reduceQuantity = catchAsync(async (req, res) => {

    // URLから商品IDを取得
    const { variantId } = req.params;

    await cartService.reduceQuantity(req.user._id, variantId);
    res.redirect('/cart');
});

// カートの商品を削除する
module.exports.deleteOne = catchAsync(async (req, res) => {

    // URLから商品IDを取得
    const { variantId } = req.params;

    const ret = await cartService.deleteOne(req.user._id, variantId);
    if (ret) {
        req.flash('success', 'カートから商品を削除しました');
    }
    
    res.redirect('/cart');
});