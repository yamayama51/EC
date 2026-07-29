
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者の商品バリエーションルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const productVariantController = require('../../controllers/admin/productVariantController');
const { productVariantSchema } = require('../../schemas/schemas');

const { validate } = require('../../middlewares/middlewares');

// バリエーション一覧
router.route('/products/:id/variants')
    .get(productVariantController.index)
    .post(validate(productVariantSchema), productVariantController.createVariant)

// バリエーション詳細
router.route('/products/:id/variants/:variantId')
    .put(validate(productVariantSchema), productVariantController.updateVariant)
    .delete(productVariantController.deleteVariant)

// バリエーション編集
router.route('/products/:id/variants/:variantId/edit')
    .get(productVariantController.renderEditForm)

module.exports = router;