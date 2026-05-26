// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | レビューのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;

// レビュースキーマの定義
const reviewSchema = new Schema({

	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'ユーザーIDは必須です'],
	},
	product: {
		type: Schema.Types.ObjectId,
		ref: 'Product',
		required: [true, '商品IDは必須です'],
		},
	rating: {
		type: Number,
		required: [true, 'レーティングは必須です'],
		min: 1,
		max: 5,
	},
	title: {
		type: String,
		required: [true, 'タイトルは必須です'],
		trim: true,
	},
	body: {
		type: String,
		required: [true, '本文は必須です'],
		trim: true,
	}
}, { 
	timestamps: true 
});

module.exports = mongoose.model('Review', reviewSchema);