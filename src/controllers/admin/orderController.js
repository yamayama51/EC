
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用の注文のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { format } = require('date-fns');

const orderAdminService = require('../../services/admin/orderService');
const orderService = require('../../services/orderService');
const emailService = require('../../services/emailService');

const { ORDER_STATUS_VALUES } = require('../../constants/index');

const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');

// 注文一覧を表示
module.exports.index = catchAsync(async (req, res) => {

    // 一覧の取得
    const { orders, pagination, statusFilter } = await orderAdminService.getOrdersForAdmin(
        req.query.status, 
        req.query.page
    );

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
    const existingOrder = await orderService.getOrderById(orderId);
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

    // 注文ステータスを更新
    const result = await orderAdminService.updateOrderStatus(orderId, status);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/admin/orders');
    }

    logger.info(logMsg.ADMIN_ORDER_STATUS.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            orderId: orderId,
            oldStatus: oldStatus,
            newStatus: result.updatedOrder.status
        }
    );

    // 注文ステータス更新メール
    await emailService.sendUpdateStatusEmail(result.updatedOrder.user, status, result.updatedOrder);

    req.flash('success', '注文ステータスを更新しました');
    res.redirect('/admin/orders');
});