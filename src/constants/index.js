
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

// 注文ステータスの配列
const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

// 商品のサイズ
const PRODUCT_SIZES_CONFIG = {
    free: { label: 'FREE', order: 0 },
    s: { order: 1 },
    m: { order: 2 },
    l: { order: 3 },
    xl: { order: 4 },
};

// 商品サイズのの文字列の配列
const PRODUCT_SIZES_VALUES = Object.keys(PRODUCT_SIZES_CONFIG);

// デフォルトのサイズを設定
const DEFAULT_SIZE = Object.keys(PRODUCT_SIZES_CONFIG)[0];
const DEFAULT_SIZE_ORDER = Object.values(PRODUCT_SIZES_CONFIG)[0].order;

module.exports = { 
    MAX_PRODUCT_QTY,
    ORDER_STATUS,
    ORDER_STATUS_VALUES,
    PRODUCT_SIZES_CONFIG,
    PRODUCT_SIZES_VALUES,
    DEFAULT_SIZE,
    DEFAULT_SIZE_ORDER
};

