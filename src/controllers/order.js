
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { format } = require('date-fns');

const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');

// 注文一覧の表示
module.exports.index = async (req, res) => {

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // ユーザーに一致するオーダー情報を取得
    const orders = await Order.find({ user: userId })
        .populate('items.productId')
        .sort({ createdAt: -1 }
    );

    res.render('orders/index', { orders, format });
}

// オーダーの作成処理
module.exports.createOrder = async (req, res) => {

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // カート情報を取得
    let cart = await Cart.findOne({ user: userId }).populate('items.productId');
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
        await cart.save();
    }

    // カートが空なら何もしない
    if (cart.items.length === 0) return res.redirect('/cart');

    // アイテムの最大注文数チェック
    for (let item of cart.items) {
        if (item.quantity > 10) {
            req.flash('error', '一度に購入できる数量は10個までです');
            return res.redirect('/cart');
        }
    }

    // カート内のアイテム情報を取得する
    let total = 0;
    const orderItems = cart.items.map(item => {
        total += item.productId.price * item.quantity;
        return {
            productId: item.productId._id,
            name: item.productId.name,
            quantity: item.quantity,
            priceAtPurchase: item.productId.price,
        }
    });

    // Orderを作成
    const order = new Order({
        user: userId,
        items: orderItems,
        totalPrice: total,
    });

    // Orderを保存
    await order.save();

    // カートを空にして保存
    cart.items = [];
    await cart.save();

    req.flash('success', '注文が完了しました');
    res.redirect(`/orders/success?orderId=${order._id}`);

}

// 注文詳細画面の表示
module.exports.renderShowForm = async (req, res) => {

    // 注文を1件取得
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.productId');

    // orderを取得できない場合、注文者本人でない場合、管理者でない場合(管理者であれば閲覧可能)
    if (!order || (!order.user.equals(req.user._id)) && !req.user.isAdmin) {
        req.flash('error', '注文が見つかりませんでした');
        return res.redirect('/orders');
    }

    res.render('orders/show', { order, format });
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