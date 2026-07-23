
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カート操作処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Cart = require('../models/cart');

const { MAX_PRODUCT_QTY } = require('../constants/index');

// 引数のユーザIDのカート情報を返す
module.exports.getCartData = async (userId) => {

    // カート情報を取得
    let cart = await Cart.findOne({ user: userId })
        .populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: { 
                path: 'product',
                model: 'Product'
            }
        }
    );

    // カート内の各商品が現在販売中かを確認し販売中でなければ削除
    for (let item of cart.items) {
        // バリアントあり・商品あり・商品表示中のみに絞る
        if (!item.variantId || !item.variantId.product || !item.variantId.product.isActive) {
            cart.items = cart.items.filter(item => {
                return item.variantId &&
                    item.variantId.product &&
                    item.variantId.product.isActive == true;
            });
        }
    }
    await cart.save();

    // 商品の合計金額を計算する
    let total = 0;
    for (let item of cart.items) {
        total += item.variantId.product.price * item.quantity;
    }

    return {
        cart, 
        total
    }
}

// カートに追加する
module.exports.addToCart = async (userId, variantId, quantity) => {

    let cart = await Cart.findOne({ user: userId });

    // すでに同じ商品がカートにあるかを確認する
    const existingItem = cart.items.find(item => item.variantId.equals(variantId));

    // 現在カートに入っている数量を取得
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    // 現在のカート内と追加数量の合計が10を超えるかを確認
    const totalQuantity = currentQuantityInCart + parseInt(quantity);
    if (totalQuantity > 10) {
        return { success: false, message: '一度にカートに入れられるのは10個までです'};
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

    return { success: true };
}

// カート内の数量を加算
module.exports.addQuantity = async (userId, variantId) => {

    let cart = await Cart.findOne({ user: userId });

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
}

// カート内の数量を減算
module.exports.reduceQuantity = async (userId, variantId) => {

    let cart = await Cart.findOne({ user: userId });

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
        } else {

            // 数量を-1して保存
            cartItem.quantity -= 1;
            await cart.save();
        }
    }
}

// カート商品の削除
module.exports.deleteOne = async (userId, variantId) => {

    // 該当商品をカートから削除
    const updatedCart = await Cart.findOneAndUpdate(
        { user: userId }, 
        {
            $pull: { items: { variantId: variantId } }
        },
        { new: true }
    );

    if (!updatedCart) {
        return false;
    }

    return true;
}