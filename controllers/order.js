
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const User = require('../models/user');
const Order = require('../models/order');

// オーダーの作成処理
module.exports.createOrder = async (req, res) => {

    // ユーザー情報を取得
    const user = await User.findById(req.user._id).populate('cart.productId');

    // カートが空なら何もしない
    if (user.cart.length === 0) return res.redirect('/cart');

    // アイテム情報を取得する
    const orderItems = user.cart.map(item => {
        return {
            productId: item.productId._id,
            quantity: item.quantity,
            priceAtPurchase: item.productId.price,
        }
    });

    // 商品の合計金額を計算する
    let total = 0;
    for (let item of user.cart) {
        total += item.productId.price * item.quantity;
    }

    // Orderを作成
    const order = new Order({
        user: user._id,
        items: orderItems,
        totalPrice: total,
        isPaid: true,
    });

    // Orderを保存
    await order.save();

    // カートを空にして保存
    user.cart = [];
    await user.save();

    req.flash('success', '注文が完了しました');

    res.redirect('/products');
}