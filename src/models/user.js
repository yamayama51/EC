
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
}, {
	timestamps: true
});

// ユーザー名・パスワード等を自動で生成する
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose, {
	usernameField: 'email'
});

// エクスポートして外部で使用できるようにする
module.exports = mongoose.model('User', userSchema);