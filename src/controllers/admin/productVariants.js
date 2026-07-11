
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用の商品バリエーションのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Product = require('../../models/product');
const Variant = require('../../models/productVariant');
const { PRODUCT_SIZES_CONFIG } = require('../../constants/index');

const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');

// 商品に紐づくバリエーションの一覧取得
module.exports.index = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 商品を取得
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // バリエーションを取得
    const variants = await Variant.find({ product: id }).sort({ sizeOrder: 1 });
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
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // バリエーションを取得
    const variant = await Variant.findById(variantId);
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

    try {
        // サイズに応じて順番をつける
        const sizeInput = req.body.variant.size;

        // 定数から対応する順番を取得
        const sizeOrder = PRODUCT_SIZES_CONFIG[sizeInput]?.order ?? 99;

        const variant = new Variant({
            product: id,
            size: sizeInput,
            sizeOrder: sizeOrder,
        });

        await variant.save();

        logger.info(logMsg.ADMIN_VARIANT.CREATE_END,
            { 
                path: req.path, 
                userId: req.user._id, 
                username: req.user.username,
                productId: id,
                variantId: variant._id
            }
        );

        req.flash('success', '商品バリエーションを登録しました');

        res.redirect(`/admin/products/${id}/variants`);
    } catch (err) {
        if (err.code === 11000) {
            req.flash('error', 'そのサイズは既に登録されています');
            return res.redirect(`/admin/products/${id}/variants`);
        }
    }
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

    try {
        // バリエーションを取得
        let variant = await Variant.findById(variantId);
        if (!variant) {
            req.flash('error', '対象のバリエーションが見つかりません');
            return res.redirect(`/admin/products/${id}/variants`);
        }

        // リクエスト内容に書き換え
        variant.size = req.body.variant.size;
        
        await variant.save();

        logger.info(logMsg.ADMIN_VARIANT.UPDATE_END,
            { 
                path: req.path, 
                userId: req.user._id, 
                username: req.user.username,
                productId: id,
                variantId: variantId
            }
        );

        req.flash('success', '商品バリエーションを更新しました');

        res.redirect(`/admin/products/${id}/variants`);
    } catch (err) {
        if (err.code === 11000) {
            req.flash('error', 'そのサイズは既に登録されています');
            return res.redirect(`/admin/products/${id}/variants`);
        }
    }
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

    let variant = await Variant.findById(variantId);
    if (!variant) {
        req.flash('error', '対象のバリエーションが見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // 対象商品に紐づくバリエーションの個数を調べる
    const variantCount = await Variant.countDocuments({ product: id });
    
    // 1件の場合削除不可
    if (variantCount === 1) {
        req.flash('error', 'バリエーションは1件以上必須です');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // 対象カテゴリーを削除する
    variant = await Variant.findByIdAndDelete(variantId);

    logger.info(logMsg.ADMIN_VARIANT.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: variantId
        }
    );

    req.flash('success', 'バリエーションを削除しました');
    res.redirect(`/admin/products/${id}/variants`);

});