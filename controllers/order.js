
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');

// オーダーの作成処理
module.exports.createOrder = async (req, res) => {

    // ユーザー情報を取得
    const user = await User.findById(req.user._id).populate('cart.productId');

    // カートが空なら何もしない
    if (user.cart.length === 0) return res.redirect('/cart');

    // カート内の各商品に対して在庫確認の処理を実行
    for (let item of user.cart) {

        // 今の商品在庫と注文数を定義
        const currentStock = item.productId.stock;
        const requestQty = item.quantity;

        if (currentStock < requestQty) {
            req.flash('error', `${item.productId.name}の在庫が不足しています (残り${currentStock}個)`);
            return res.redirect('/cart');
        }
    }

    // カート内のアイテム情報を取得する
    const orderItems = user.cart.map(item => {
        return {
            productId: item.productId._id,
            quantity: item.quantity,
            priceAtPurchase: item.productId.price,
        }
    });

    // MEMO:関数に切り分けたい
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

    // 在庫の減算処理を実行
    for (let item of user.cart) {
        await Product.findByIdAndUpdate(item.productId._id, {
            $inc: { stock: -item.quantity }
        });
    }

    // カートを空にして保存
    user.cart = [];
    await user.save();

    req.flash('success', '注文が完了しました');

    res.redirect(`/orders/success?orderId=${order._id}`);
}

// 注文完了画面の表示
module.exports.renderSuccessForm = (req, res) => {

    // URLからorderIdを取得
    const { orderId } = req.query;

    // queryがない場合、一覧画面へ遷移
    if (!orderId) {
        return res.redirect('/products');
    }

    res.render('orders/success', { orderId });
}