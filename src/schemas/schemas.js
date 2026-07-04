
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | サーバー側のバリデーションチェックファイル
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Joi = require('joi');
const { PRODUCT_SIZES_VALUES } = require('../constants/index');

// ユーザースキーマのバリデーションルールの作成
module.exports.userSchema = Joi.object({
	email: Joi.string().email().required().trim(),
	password: Joi.string().required().min(8),
	username: Joi.string().required().min(2).max(20),
	isAdmin: Joi.boolean().default(false),
});

// 商品スキーマのバリデーションルールを作成する
module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0).max(10000000),
        description: Joi.string().required(),
        images: Joi.array().items(
			Joi.object({
				url: Joi.string().required(),
				filename: Joi.string().required(),
				originalName: Joi.string().optional(),
			})
		).optional(),
		category: Joi.string().required(),
    }).required(),
	deleteImages: Joi.array(),
	imageOrder: Joi.string().allow('', null),
});

// 商品バリエーションスキーマのバリデーションルールを作成する
module.exports.productVariantSchema = Joi.object({
    variant: Joi.object({
        size: Joi.string().required().valid(...PRODUCT_SIZES_VALUES)
    }).required()
});

// カテゴリースキーマのバリデーションルールを作成
module.exports.categorySchema = Joi.object({
	category: Joi.object({
		name: Joi.string().required().max(20),
	}).required(),
});

// レビュースキーマのバリデーションルールを作成する
module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5),
		title: Joi.string().required().max(30),
		body: Joi.string().required(),
	}).required()
});

// カートスキーマのバリデーションルールの作成
module.exports.cartSchema = Joi.object({
	cart: Joi.object({
		productId: Joi.string().required(),
		quantity: Joi.number().integer().min(1).max(10).required()
	}).required()
});

// オーダースキーマのバリデーションルールの作成
module.exports.orderSchema = Joi.object({
	order: Joi.object({
		user: Joi.string().required(),
		orderNumber: Joi.string().required(),
		items: Joi.array().items(
			Joi.object({
				productId: Joi.string().required(),
				quantity: Joi.number().integer().min(1).max(10).required(),
				priceAtPurchase: Joi.number().min(0).required(),
			})
		).min(1).required(),
		totalPrice: Joi.number().min(0).required(),
		isPaid: Joi.boolean().default(true),
	}).required()
});