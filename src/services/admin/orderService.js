
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 注文操作処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Order = require('../../models/order');

const { getPaginationData } = require('../../helpers/pagination');
const { ORDER_STATUS_VALUES } = require('../../constants/index');

// 対象の注文一覧を返す
module.exports.getOrdersForAdmin = async (queryParams, pageQuery) => {

    // フィルター条件を取得
    const statusFilter = queryParams;

    // ステータスがあればクエリを組み立てる
    const query = statusFilter ? { status: statusFilter } : {};

    // 注文の総数を取得
    const totalItemsCount = await Order.countDocuments(query);

    // ページングに必要なデータを集める
    const pagination = getPaginationData(pageQuery, totalItemsCount);

    // ページ数からlimit件分の注文データを取得
    const orders = await Order.find(query)
        .populate('items.variantId')
        .populate('user')
        .skip((pagination.currentPage - 1) * pagination.LIMIT)
        .limit(pagination.LIMIT)
        .sort({ createdAt: -1})
    ;

    return { orders, pagination, statusFilter };
}

// 注文ステータスの更新
module.exports.updateOrderStatus = async (orderId, statusData) => {

    // 許可されたステータスを取得
    const validStatues = ORDER_STATUS_VALUES;

    // 許可されたステータス以外ならエラー
    if (!validStatues.includes(statusData)) {
        return { success: false, message: '無効なステータスです'};
    }

    // 対象オーダーのステータスを更新
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: statusData },
        { new: true })
        .populate('user', 'username email');

    return { success: true, updatedOrder };
}