
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Cart = require('../models/cart');

const { MAX_PRODUCT_QTY } = require('../constants/index');

const catchAsync = require('../helpers/catchAsync');

// カート画面表示
module.exports.index = catchAsync(async (req, res) => {

    // カート情報を取得
    let cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: { 
                path: 'product',
                model: 'Product'
            }
        }
    );
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
    }

    // 商品の合計金額を計算する
    // TODO : カートに入っているアイテムが削除されるとばぐります
    let total = 0;
    for (let item of cart.items) {
        total += item.variantId.product.price * item.quantity;
    }

    // // カート内に売り切れの商品があるかどうかを確認
    // const hasSoldOut = cart.items.some(item => item.productId.stock <= 0);

    // res.render('cart/index', { cart, total, hasSoldOut });
    res.render('cart/index', { cart, total });
});

// カートに追加
module.exports.addToCart = catchAsync(async (req, res) => {

    // 入力データを取得
    const { variantId, quantity } = req.body.cart;

    // カートを取得し、ない場合は作成
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
    }

    // // 在庫数が0以下なら戻す
    // const product = await Product.findById(productId);
    // if (!product || product.stock <= 0) {
    //     req.flash('error', '申し訳ありません。この商品は現在売り切れです。');
    //     return res.redirect(`/products/${productId}`);
    // }

    // すでに同じ商品がカートにあるかを確認する
    const existingItem = cart.items.find(item => item.variantId.equals(variantId));

    // 現在カートに入っている数量を取得
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    // 現在のカート内と追加数量の合計が10を超えるかを確認
    const totalQuantity = currentQuantityInCart + parseInt(quantity);
    if (totalQuantity > 10) {
        req.flash('error', '一度にカートに入れられるのは10個までです');
        return res.redirect(`/products/${productId}`);
    }

    if (existingItem) {

        // すでにカートにあればquantity分増やす
        existingItem.quantity += parseInt(quantity);

    } else {
        
        // なければ新しく追加
        cart.items.push({ variantId, quantity });
    }

    // ユーザー情報を保存
    await cart.save();
    
    res.redirect('/cart');
});

// カート内の数量を加算
module.exports.addQuantity = catchAsync(async (req, res) => {

    // URLから商品IDを取得
    const { variantId } = req.params;

    // カート情報を取得
    // let cart = await Cart.findOne({ user: req.user._id }).populate('items.productId');
    let cart = await Cart.findOne({ user: req.user._id });
    // let cart = await Cart.findOne({ user: req.user._id })
    //     .populate({
    //         path: 'items.variantId',
    //         populate: {
    //             path: 'product',
    //             model: 'Product'
    //         }
    //     }
    // );
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
    }

    // カートのアイテムを探す
    const cartItem = cart.items.find(item => item.variantId.equals(variantId));

    // 数量を+1して保存
    if (cartItem) {

        // 最大注文数なら変えない
        if (cartItem.quantity < MAX_PRODUCT_QTY) {

            // すでにカートにあればquantity分増やす
            cartItem.quantity += 1;
            await cart.save();
        }
    }

    res.redirect('/cart');
});

// カート内の数量を減算
module.exports.reduceQuantity = catchAsync(async (req, res) => {

    // URLから商品IDを取得
    const { variantId } = req.params;

    // カート情報を取得
    // let cart = await Cart.findOne({ user: req.user._id }).populate('items.productId');
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
    }

    // カートのアイテムを探す
    const cartItem = cart.items.find(item => item.variantId.equals(variantId));
    
    if (cartItem) {

        // 数量が1ならアイテムをカートから削除する
        if (cartItem.quantity === 1) {

            // 該当商品をカートから削除
            await Cart.findOneAndUpdate(
                { user: req.user._id }, 
                {
                    $pull: { items: { variantId: variantId } }
                }
            );
            req.flash('success', 'カートから商品を削除しました');
        } else {

            // 数量を-1して保存
            cartItem.quantity -= 1;
            await cart.save();
        }
    }

    res.redirect('/cart');
});

// カートの商品を削除する
module.exports.deleteOne = catchAsync(async (req, res) => {

    // URLから商品IDを取得
    const { variantId } = req.params;

    // 該当商品をカートから削除
    await Cart.findOneAndUpdate(
        { user: req.user._id }, 
        {
            $pull: { items: { variantId: variantId } }
        }
    );

    req.flash('success', 'カートから商品を削除しました');

    res.redirect('/cart');
});