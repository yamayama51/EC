
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のバリエーションのモデル
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;
const { PRODUCT_SIZES_VALUES, DEFAULT_SIZE, DEFAULT_SIZE_ORDER } = require('../constants');

// 商品バリエーションスキーマ定義
const productVariantSchema = new Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, '商品は必須です']
    },
    size: {
        type: String,
        required: [true, 'サイズは必須です'],
        enum: PRODUCT_SIZES_VALUES,
        default: DEFAULT_SIZE
    },
    sizeOrder: {
        type: Number,
        required: [true, 'sizeOrderは必須です'],
        default: DEFAULT_SIZE_ORDER
    }
}, {
    timestamps: true
});

productVariantSchema.index({ product: 1, size: 1 }, { unique: true });

module.exports = mongoose.model('ProductVariant', productVariantSchema);