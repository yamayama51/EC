
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | オーダーのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;

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
	isPaid: {
		type: Boolean,
		default: true,
	}
}, {
	timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);