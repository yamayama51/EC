
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { PRODUCT_CATEGORIES } = require('../constants');

// 画像のスキーマ定義
const imageSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
});

// 画像スキーマに仮想のプロパティを追加
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_120,h_120,c_fill');
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
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'カテゴリーは必須です']
    },
    stock: {
        type: Number,
        required: [true, '在庫数は必須です'],
        min: 0,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, {
    timestamps: true
});

// 売り切れかどうかのフラグを追加
productSchema.virtual('isSoldOut').get(function() {
    return this.stock <= 0;
});

// エクスポートして外部で使用できるようにする
module.exports = mongoose.model('Product', productSchema);