
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { PRODUCT_CATEGORIES } = require('../constants');
const { required } = require('joi');

// 画像のスキーマ定義
const imageSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    }
});

// 商品スキーマ定義
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
    images: {
        type: [imageSchema],
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