
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | サーバー側のバリデーションチェックファイル
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Joi = require('joi');
const { PRODUCT_CATEGORIES } = require('../constants/index');

// ユーザースキーマのバリデーションルールの作成
module.exports.userSchema = Joi.object({
	username: Joi.string().required().alphanum().min(3).max(20).trim(),
	email: Joi.string().email().required().trim(),
	password: Joi.string().required().min(8),
	isAdmin: Joi.boolean().default(false),
	cart: Joi.array().items(
		Joi.object({
			productId: Joi.string().required(),
			quantity: Joi.number().integer().min(1).required(),
		})
	).default([])
});

// 商品スキーマのバリデーションルールを作成する
module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0).max(10000000),
        description: Joi.string().required(),
        image: Joi.string().required(),
        category: Joi.string().valid(...Object.values(PRODUCT_CATEGORIES)).required(),
        stock: Joi.number().required().min(0).max(100000),
    }).required()
});

// オーダースキーマのバリデーションルールの作成
module.exports.orderSchema = Joi.object({
	order: Joi.object({
		user: Joi.string().required(),
		items: Joi.array().items(
			Joi.object({
				productId: Joi.string().required(),
				quantity: Joi.number().min(1).required(),
				priceAtPurchase: Joi.number().min(0).required(),
			})
		).min(1).required(),
		totalPrice: Joi.number().min(0).required(),
		isPaid: Joi.boolean().default(true),
	}).required()
});