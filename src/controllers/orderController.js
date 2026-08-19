
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 注文系処理のリクエストを受け取り結果を返す
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { format } = require('date-fns');

const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const emailService = require('../services/emailService');

const catchAsync = require('../helpers/catchAsync');
const logger = require('../helpers/logger');
const logMsg = require('../constants/logMessage');

// 注文一覧の表示
module.exports.index = catchAsync(async (req, res) => {

    // セッションからユーザーIDを取得
    const userId = req.user._id;

    // ユーザーIDに一致するオーダー一覧を取得
    const orders = await orderService.getOrderListByUserId(userId);

    res.render('orders/index', { orders, format });
});

// 注文詳細画面の表示
module.exports.renderShowForm = catchAsync(async (req, res) => {

    // 注文を1件取得
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

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
    const order = await orderService.getOrderById(orderId);

    // オーダーが自分の注文ではない場合
    if (!order || !order.user.equals(req.user._id)) {
        return res.redirect('/products');
    }

    res.render('orders/success', { order });
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
    let cart = await cartService.getCartByUserId(userId);
    if (cart.items.length === 0) return res.redirect('/cart');

    // 数量チェック
    const quantityCheck = orderService.validateItemQuantities(cart);
    if (!quantityCheck.isValid) {
        req.flash('error', quantityCheck.message);
        return res.redirect('/cart');
    }

    // オーダーの作成
    const order = await orderService.createOrder(userId, cart);

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
            order: order
        }
    );

    // 注文者・管理者へメールを送信する
    await emailService.sendOrderPlacedEmail(req.user, order);
    await emailService.sendAdminNotificationEmail(req.user, order);

    req.flash('success', '注文が完了しました');
    res.redirect(`/orders/success?orderId=${order._id}`);

});