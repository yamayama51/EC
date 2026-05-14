
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ユーザーのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

// スキーマの定義
const userSchema = new Schema({

	email: {
		type: String,
		required: [true, 'メールアドレスは必須です'],
		unique: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	cart: [
		{
			productId: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: [true, '商品IDは必須です'],
			},
			quantity: {
				type: Number,
				default: 1,
				min: 1,
			}
		}
	]
}, {
	timestamps: true
});

// ユーザー名・パスワード等を自動で生成する
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

// エクスポートして外部で使用できるようにする
module.exports = mongoose.model('User', userSchema);