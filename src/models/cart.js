
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カートのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;

// スキーマの定義
const cartSchema = new Schema ({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: [true, 'ユーザーは必須です'],
    },
	items: [
		{
			variantId: {
				type: Schema.Types.ObjectId,
				ref: 'ProductVariant',
				required: [true, 'バリアントIDは必須です'],
			},
			quantity: {
				type: Number,
                required: [true, '数量は必須です'],
				default: 1,
				min: 1,
			}
		}
	],
}, {
	timestamps: true,
});

// エクスポートして外部で使用できるようにする
module.exports = mongoose.model('Cart', cartSchema);