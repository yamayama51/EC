
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { PRODUCT_CATEGORIES } = require('../constants');

// スキーマの定義
const productSchema = new Schema({

    name: {
        type: String,
        required: [true, '商品名は必須です'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, '価格は必須です'],
        min: [0, '価格は0以上である必要があります'],
    },
    description: {
        type: String,
        required: [true, '商品説明は必須です'],
    },
    image: {
        type: String,
        required: [true, '商品画像は必須です'],
    },
    category: {
        type: String,
        required: [true, 'カテゴリーは必須です'],
        enum: Object.values(PRODUCT_CATEGORIES),
    },
    stock: {
        type: Number,
        required: [true, '在庫数は必須です'],
        min: 0,
    }
}, {
    timestamps: true
});

// エクスポートして外部で使用できるようにする
module.exports = mongoose.model('Product', productSchema);