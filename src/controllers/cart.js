// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const User = require('../models/user');
const Product = require('../models/product');

const { MAX_PRODUCT_QTY } = require('../constants/index');

// カート画面表示
module.exports.index = async (req, res) => {

    // ユーザー情報を取得
    const user = await User.findById(req.user._id).populate('cart.productId');

    // 商品の合計金額を計算する
    let total = 0;
    for (let item of user.cart) {
        total += item.productId.price * item.quantity; 
    }

    // カート内に売り切れの商品があるかどうかを確認
    const hasSoldOut = user.cart.some(item => item.productId.stock <= 0);

    res.render('cart/index', { user, total, hasSoldOut });
}

// カートに追加
module.exports.addToCart = async (req, res) => {

    // 入力データを取得
    const { productId, quantity } = req.body;

    // セッションからユーザーを取得
    const user = await User.findById(req.user._id);

    // 在庫数が0以下なら戻す
    const product = await Product.findById(productId);
    if (!product || product.stock <= 0) {
        req.flash('error', '申し訳ありません。この商品は現在売り切れです。');
        return res.redirect(`/products/${productId}`);
    }

    // すでに同じ商品がカートにあるかを確認する
    const existingItem = user.cart.find(item => item.productId.equals(productId));

    // 現在カートに入っている数量を取得
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    // 現在のカート内と追加数量の合計が10を超えるかを確認
    const totalQuantity = currentQuantityInCart + parseInt(quantity);
    if (totalQuantity > 10) {
        console.log(totalQuantity);
        req.flash('error', '一度にカートに入れられるのは10個までです');
        return res.redirect(`/products/${productId}`);
    }

    if (existingItem) {

        // すでにカートにあればquantity分増やす
        existingItem.quantity += parseInt(quantity);

    } else {
        
        // なければ新しく追加
        user.cart.push({ productId, quantity });
    }

    // ユーザー情報を保存
    await user.save();
    
    res.redirect('/cart');
}

// カート内の数量を加算
module.exports.addQuantity = async (req, res) => {

    // URLから商品IDを取得
    const { productId } = req.params;

    // セッションから社員情報を取得
    const user = await User.findById(req.user._id);

    // カートのアイテムを探す
    const cartItem = user.cart.find(item => item.productId.equals(productId));

    // 数量を+1して保存
    if (cartItem) {

        // 最大注文数なら変えない
        if (cartItem.quantity < MAX_PRODUCT_QTY) {

            // すでにカートにあればquantity分増やす
            cartItem.quantity += 1;
            await user.save();
        }
    }

    res.redirect('/cart');
}

// カート内の数量を減算
module.exports.reduceQuantity = async (req, res) => {

    // URLから商品IDを取得
    const { productId } = req.params;

    // セッションから社員情報を取得
    const user = await User.findById(req.user._id);

    // カートのアイテムを探す
    const cartItem = user.cart.find(item => item.productId.equals(productId));
    
    if (cartItem) {

        // 数量が1ならアイテムをカートから削除する
        if (cartItem.quantity === 1) {

            // ユーザー内の該当商品をカートから削除
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { cart: { productId: productId } }
            });
            req.flash('success', 'カートから商品を削除しました');
        } else {

            // 数量を-1して保存
            cartItem.quantity -= 1;
            await user.save();
        }
    }

    res.redirect('/cart');
}

// カートの商品を削除する
module.exports.deleteOne = async (req, res) => {

    // URLから商品IDを取得
    const { productId } = req.params;

    // ユーザー内の該当商品をカートから削除
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { cart: { productId: productId } }
    });

    req.flash('success', 'カートから商品を削除しました');

    res.redirect('/cart');
}