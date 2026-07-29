
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用の商品バリエーションのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Product = require('../../models/product');
const Variant = require('../../models/productVariant');

const productService = require('../../services/productService');
const variantService = require('../../services/admin/productVariantService');

const { PRODUCT_SIZES_CONFIG } = require('../../constants/index');

const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');

// 商品に紐づくバリエーションの一覧取得
module.exports.index = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 商品を取得
    const product = await productService.getProductData(id);
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // バリエーションを取得
    const variants = await variantService.getVariantsByproductId(id);
    if (!variants) {
        req.flash('error', '対象のバリエーションが見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    res.render('admin/variants/index', { id, product, variants });
});

// バリエーション編集画面取得
module.exports.renderEditForm = catchAsync(async (req, res) => {

    // URLから商品ID、バリエーションIDを取得
    const { id, variantId } = req.params;

    // 商品を取得
    const product = await productService.getProductData(id);
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // バリエーションを取得
    const variant = await variantService.getVariantById(variantId)
    if (!variant) {
        req.flash('error', '対象のバリエーションが見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    res.render('admin/variants/edit', { id, product, variant });
});

// バリエーションの登録
module.exports.createVariant = catchAsync(async (req, res) => {

    // URLから商品のIDを取得
    const { id } = req.params;

    logger.info(logMsg.ADMIN_VARIANT.CREATE_SATRT,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id
        }
    );

    // バリアント登録
    const result = await variantService.createVariant(id, req.body.variant);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect(`/admin/products/${id}/variants`);
    }

    logger.info(logMsg.ADMIN_VARIANT.CREATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: result.variant._id
        }
    );

    req.flash('success', '商品バリエーションを登録しました');
    res.redirect(`/admin/products/${id}/variants`);
});

// バリエーションの編集
module.exports.updateVariant = catchAsync(async (req, res) => {

    // URLから商品のID、バリエーションIDを取得
    const { id, variantId } = req.params;

    logger.info(logMsg.ADMIN_VARIANT.UPDATE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: variantId
        }
    );

    // バリアント更新
    const result = await variantService.updateVariant(id, variantId, req.body.variant);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect(`/admin/products/${id}/variants`);
    }

    logger.info(logMsg.ADMIN_VARIANT.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: result.variant._id
        }
    );

    req.flash('success', 'バリエーションを更新しました');
    res.redirect(`/admin/products/${id}/variants`);
});

// バリエーションの削除
module.exports.deleteVariant = catchAsync(async (req, res) => {

    // URLから商品のID、バリエーションIDを取得
    const { id, variantId } = req.params;

    logger.info(logMsg.ADMIN_VARIANT.DELETE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: variantId
        }
    );

    // バリエーションの削除
    const result = await variantService.deleteVariant(id, variantId);
    if (!result.success) {
        req.flash('error', result.message);
        return res.redirect(`/admin/products/${id}/variants`);
    }

    logger.info(logMsg.ADMIN_VARIANT.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: result.variant._id
        }
    );

    req.flash('success', 'バリエーションを削除しました');
    res.redirect(`/admin/products/${id}/variants`);

});