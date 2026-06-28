
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
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
});

// 商品のサイズ
const PRODUCT_SIZES = Object.freeze({
    FREE: 'free',
    S: 's',
    M: 'm',
    L: 'l',
    XL: 'xl'
});

const PRODUCT_SIZES_VALUES = Object.values(PRODUCT_SIZES);

module.exports = { 
    MAX_PRODUCT_QTY,
    ORDER_STATUS,
    PRODUCT_SIZES,
    PRODUCT_SIZES_VALUES
};

