
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用の注文のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { format } = require('date-fns');

const Order = require('../../models/order');
const { getPaginationData } = require('../../helpers/pagination');
const { sendEmail } = require('../../helpers/mailer');
const templates = require('../../config/mailTemplate');
const { ORDER_STATUS_VALUES } = require('../../constants/index');

const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');

// 注文一覧を表示
module.exports.index = catchAsync(async (req, res) => {

    // フィルター条件を取得
    const statusFilter = req.query.status;

    // ステータスがあればクエリを組み立てる
    const query = statusFilter ? { status: statusFilter } : {};

    // 注文の総数を取得
    const totalItemsCount = await Order.countDocuments(query);

    // ページングに必要なデータを集める
    const pagination = getPaginationData(req.query.page, totalItemsCount);

    // ページ数からlimit件分の注文データを取得
    const orders = await Order.find(query)
        .populate('items.variantId')
        .populate('user')
        .skip((pagination.currentPage - 1) * pagination.LIMIT)
        .limit(pagination.LIMIT)
        .sort({ createdAt: -1})
    ;

    res.render('admin/orders/index', { 
        ORDER_STATUS_VALUES,
        currentStatus: statusFilter,
        orders,
        format,
        pagination,
        baseUrl: 'orders',
        queryParams: statusFilter ? `&status=${statusFilter}` : ''
    });
});

// 注文ステータスの変更
module.exports.updateOrderStatus = catchAsync(async (req, res) => {

    // URLからオーダーIDを取得
    const { orderId } = req.params;

    // 入力値を取得
    const { status } = req.body;

    // 更新前のステータスを取得
    const existingOrder = await Order.findById(orderId);
    const oldStatus = existingOrder.status;

    logger.info(logMsg.ADMIN_ORDER_STATUS.UPDATE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            orderId: orderId,
            oldStatus: oldStatus,
            requestStatus: status
        }
    );

    // 許可されたステータスを取得
    const validStatues = ORDER_STATUS_VALUES;

    // 許可されたステータス以外ならエラー
    if (!validStatues.includes(status)) {
        req.flash('error', '無効なステータスです');
        return res.redirect('/admin/orders');
    }

    // 対象オーダーのステータスを更新
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });

    logger.info(logMsg.ADMIN_ORDER_STATUS.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            orderId: orderId,
            oldStatus: oldStatus,
            newStatus: updatedOrder.status
        }
    );

    if (!templates[status]) {
        console.error(`Error: Template for status "${status}" not found.`);
        throw new Error(`ステータス "${status}" に対応するメールテンプレートが見つかりません`);
    }

    // メール用のデータを取得
    const data = {
        username: req.user.username,
        orderNumber: updatedOrder.orderNumber,
    }

    // 注文確定のメールフォーマットを取得
    const template = templates[status](data);

    // 注文完了メールを送信する
    await sendEmail(req.user.email, template.subject, template.body);

    req.flash('success', '注文ステータスを更新しました');
    res.redirect('/admin/orders');
});