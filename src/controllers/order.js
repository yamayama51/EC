
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { format } = require('date-fns');

const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');

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

    // ユーザー情報を取得
    const user = await User.findById(req.user._id).populate('cart.productId');

    // カートが空なら何もしない
    if (user.cart.length === 0) return res.redirect('/cart');

    // アイテムの最大注文数チェック
    for (let item of user.cart) {
        if (item.quantity > 10) {
            req.flash('error', '一度に購入できる数量は10個までです');
            return res.redirect('/cart');
        }
    }

    // 在庫の減算に成功した商品を追跡するための一時保管場所
    const updatedProducts = [];

    try {
        for (let item of user.cart) { 
            const result = await Product.updateOne(
                {
                    // 商品在庫が注文数以上という条件
                    _id: item.productId._id,
                    stock: { $gte: item.quantity }
                },
                { 
                    // 在庫をその場で減産する
                    $inc: { stock: -item.quantity }
                }
            );

            // 変更されたドキュメント数が0の場合、在庫不在
            if (result.modifiedCount === 0) {
                req.flash('error', `${item.productId.name}の在庫が不足しています`);

                // 途中まで商品在庫を減らしていた場合、元に戻す(ロールバック)　
                // ※カート内の商品で一つでも欠品していたら注文を確定させない
                for (let rolledBackItem of updatedProducts) {
                    await Product.findByIdAndUpdate(rolledBackItem.id, {
                        $inc: { stock: rolledBackItem.qty }
                    });
                }
                return res.redirect('/cart');
            }

            // 成功したらロールバック用に配列に格納
            updatedProducts.push({ id: item.productId._id, qty: item.quantity });
        }

        // カート内のアイテム情報を取得する
        let total = 0;
        const orderItems = user.cart.map(item => {
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
        res.redirect(`/orders/success?orderId=${order._id}`);

    } catch (err) {

        // システムエラーやDBエラーなどの場合も在庫を復元する
        for (let rolledBackItem of updatedProducts) {
            await Product.findByIdAndUpdate(rolledBackItem.id, {
                $inc: { stock: rolledBackItem.qty }
            });
        }

        req.flash('error', '注文処理中に予期せぬエラーが発生しました');
        res.redirect('/cart');
    }
}

// 注文詳細画面の表示
module.exports.renderShowForm = async (req, res) => {

    // 注文を1件取得
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.productId');

    // orderを取得できない場合、
    if (!order || !order.user.equals(req.user._id)) {
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