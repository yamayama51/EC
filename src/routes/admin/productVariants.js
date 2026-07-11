
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者の商品バリエーションルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const productVariants = require('../../controllers/admin/productVariants');
const { productVariantSchema } = require('../../schemas/schemas');

const { validate } = require('../../middlewares/middlewares');

// バリエーション一覧
router.route('/products/:id/variants')
    .get(productVariants.index)
    .post(validate(productVariantSchema), productVariants.createVariant)

// バリエーション詳細
router.route('/products/:id/variants/:variantId')
    .put(validate(productVariantSchema), productVariants.updateVariant)
    .delete(productVariants.deleteVariant)

// バリエーション編集
router.route('/products/:id/variants/:variantId/edit')
    .get(productVariants.renderEditForm)

module.exports = router;