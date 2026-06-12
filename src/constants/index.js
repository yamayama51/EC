
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 定数管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 商品の最大注文可能数
const MAX_PRODUCT_QTY = 10;

// 注文時のステータス管理
const ORDER_STATUS = Object.freeze({
    PENDING: 'pending',
    PAID: 'paid',
    ARRIVED: 'arrived',
    CANCELLED: 'cancelled'
});

module.exports = { 
    MAX_PRODUCT_QTY,
    ORDER_STATUS,
};

