
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { format } = require('date-fns');

const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/cart');

const { sendEmail } = require('../helpers/mailer');
const templates = require('../config/mailTemplate');

const catchAsync = require('../helpers/catchAsync');

// ログ出力用
const logger = require('../helpers/logger');
const logMsg = require('../constants/logMessage');

// 注文一覧の表示
module.exports.index = catchAsync(async (req, res) => {

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // ユーザーに一致するオーダー情報を取得
    const orders = await Order.find({ user: userId })
        .populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: {
                path: 'product',
                model: 'Product'
            }
        }).sort({ createdAt: -1 }
    );

    res.render('orders/index', { orders, format });
});

// オーダーの作成処理
module.exports.createOrder = catchAsync(async (req, res) => {

    logger.info(logMsg.USER_ORDER.CREATE_SATRT,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username
        }
    );

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // カート情報を取得
    let cart = await Cart.findOne({ user: userId }).
        populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: {
                path: 'product',
                model: 'Product'
            }
        }
    );
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
        total += item.variantId.product.price * item.quantity;
        return {
            variantId: item.variantId._id,
            productName: item.variantId.product.name,
            size: item.variantId.size,
            quantity: item.quantity,
            priceAtPurchase: item.variantId.product.price,
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

    logger.info(logMsg.USER_ORDER.CREATE_END,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username,
            orderId: order._id
        }
    );

    // 注文ログ
    logger.order(logMsg.USER_ORDER.ORDER_INFO, 
        {
            userId: req.user._id,
            order: order.toObject()
        }
    );

    // メール用のデータを取得
    const data = {
        username: req.user.username,
        orderNumber: order.orderNumber,
        amount : order.totalPrice,
    }

    // 注文確定のメールフォーマットを取得
    const template = templates.placed(data);

    // 注文完了メールを送信する
    // await sendEmail('req.user.email', template.subject, template.body);

    req.flash('success', '注文が完了しました');
    res.redirect(`/orders/success?orderId=${order._id}`);

});

// 注文詳細画面の表示
module.exports.renderShowForm = catchAsync(async (req, res) => {

    // 注文を1件取得
    const { id } = req.params;
    const order = await Order.findById(id)
        .populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: { 
                path: 'product',
                model: 'Product'
            }
        }
    );

    // orderを取得できない場合、注文者本人でない場合、管理者でない場合(管理者であれば閲覧可能)
    if (!order || (!order.user.equals(req.user._id)) && !req.user.isAdmin) {
        req.flash('error', '注文が見つかりませんでした');
        return res.redirect('/orders');
    }

    res.render('orders/show', { order, format });
});

// 注文完了画面の表示
module.exports.renderSuccessForm = catchAsync(async (req, res) => {

    // URLからorderIdを取得
    const { orderId } = req.query; 

    // queryがない場合、一覧画面へ遷移
    if (!orderId) {
        return res.redirect('/products');
    }

    // IDからオーダーを取得
    const order = await Order.findById(orderId);

    res.render('orders/success', { order });
});