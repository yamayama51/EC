
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
	orderNumber: {
		type: String,
		unique: true
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

// 注文番号の自動採番
orderSchema.pre('save', async function() {

	// 新規の場合のみ発番をする
	if (!this.isNew) return;

	try {
		// 日付の文字列を作成
		const date = new Date();
		const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

		// 同日付の連番を取得
		const count = await mongoose.model('Order').countDocuments({
			createdAt: {
				$gte: new Date(date.setHours(0,0,0,0)),
				$lt: new Date(date.setHours(24,0,0,0))
			}
		});

		// 連番を4桁にする
		const sequence = (count + 1).toString().padStart(4, '0');

		this.orderNumber = `faze-${dateStr}-${sequence}`;
		
	} catch (err) {
		console.log('採番エラー');
	}
});

module.exports = mongoose.model('Order', orderSchema);