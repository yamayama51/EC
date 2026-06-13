
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;

const { ORDER_STATUS } = require('../constants/index');

// オーダースキーマの定義
const orderSchema = new Schema({

	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'ユーザーIDは必須です'],
	},
	items: [
		{
			productId: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: [true, '商品IDは必須です'],
			},
			name: {
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
			}
		}
	],
	totalPrice: {
		type: Number,
		required: [true, '合計金額は必須です'],
	},
	status: {
		type: String,
		enum: Object.values(ORDER_STATUS),
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