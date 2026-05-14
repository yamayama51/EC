
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 定数管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 商品のカテゴリー
const PRODUCT_CATEGORIES = Object.freeze({
    TOPS: 'Tops',
    OUTER: 'Outer',
    BOTTOMS: 'Bottoms',
    SHOES: 'Shoes',
    ACCESSORIES: 'Accessories',
});

// 商品の最大注文可能数
const MAX_PRODUCT_QTY = 10;

module.exports = { 
    PRODUCT_CATEGORIES,
    MAX_PRODUCT_QTY,
};

