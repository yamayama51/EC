
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | サーバー側のバリデーションチェックファイル
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Joi = require('joi');

// 商品スキーマのバリデーションルールを作成する
module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0).max(10000000),
        description: Joi.string().required(),
        image: Joi.string().required(),
        category: Joi.string().required(),
        stock: Joi.number().required().min(0).max(100000),
    }).required()
});