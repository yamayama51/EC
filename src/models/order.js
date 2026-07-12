
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;

const { ORDER_STATUS, ORDER_STATUS_VALUES } = require('../constants/index');

// オーダースキーマの定義
const orderSchema = new Schema({

	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'ユーザーIDは必須です'],
	},
	orderNumber: {
		type: String,
		unique: true
	},
	items: [
		{
			variantId: {
				type: Schema.Types.ObjectId,
				ref: 'ProductVariant',
				required: [true, 'バリアントIDは必須です'],
			},
			productName: {
				type: String,
				required: [true, '商品名は必須です']
			},
			quantity: {
				type: Number,
				required: [true, '注文数量は必須です'],
			},
			// 購入時の価格
			priceAtPurchase: {
				type: Number,
				required: [true, '購入時の価格は必須です'],
			},
			size: {
				type: String,
				required: [true, 'サイズの価格は必須です'],
			}
		}
	],
	totalPrice: {
		type: Number,
		required: [true, '合計金額は必須です'],
	},
	status: {
		type: String,
		enum: ORDER_STATUS_VALUES,
		default: ORDER_STATUS.PENDING,
	}
}, {
	timestamps: true,
});

// 注文の支払期限を追加
orderSchema.virtual('paymentDeadline').get(function() {
	return new Date(this.createdAt.getTime() + 30 * 60 * 1000);
});

module.exports = mongoose.model('Order', orderSchema);