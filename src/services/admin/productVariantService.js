
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品バリエーション操作処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Variant = require('../../models/productVariant');
const { PRODUCT_SIZES_CONFIG } = require('../../constants/index');

// 商品に基づくバリエーション一覧を取得
module.exports.getVariantsByproductId = async (productId) => {

    const variants = await Variant.find({ product: productId }).sort({ sizeOrder: 1 });
    return variants;
}

// バリエーションを1件取得する
module.exports.getVariantById = async (variantId) => {

    const variant = await Variant.findById(variantId);
    return variant;
}

// バリエーション登録
module.exports.createVariant = async (productId, variantData) => {

    // サイズに応じて順番をつける
    const sizeInput = variantData.size;
    const sizeOrder = PRODUCT_SIZES_CONFIG[sizeInput]?.order ?? 99;

    // 重複チェック
    const existingVariant = await Variant.findOne({ product: productId, size: sizeInput });
    if (existingVariant) {
        return { success: false, message: 'そのサイズは既に登録されています'};
    }

    const variant = new Variant({
        product: productId,
        size: sizeInput,
        sizeOrder: sizeOrder,
    });

    await variant.save();
    return { success: true, variant };
}

// バリエーション更新
module.exports.updateVariant = async (productId, variantId, variantData) => {

    const sizeOrder = PRODUCT_SIZES_CONFIG[variantData.size]?.order ?? 99;

    const variant = await Variant.findById(variantId);
    if (!variant) {
        return { success: false, message: '対象のバリエーションが見つかりません'};
    }

    // 重複チェック
    const existingVariant = await Variant.findOne({ product: productId, size: variantData.size });
    if (existingVariant) {
        return { success: false, message: 'そのサイズは既に登録されています'};
    }

    // リクエスト内容に書き換え
    variant.size = variantData.size;
    variant.sizeOrder = sizeOrder;
    
    await variant.save();
    return { success: true, variant };
}

// バリエーション削除
module.exports.deleteVariant = async (productId, variantId) => {

    const variant = await Variant.findById(variantId);
    if (!variant) {
        return { success: false, message: '対象のバリエーションが見つかりません'};
    }

    // 対象商品に紐づくバリエーションの個数を調べる
    const variantCount = await Variant.countDocuments({ product: productId });
    
    // 1件の場合削除不可
    if (variantCount === 1) {
        return { success: false, message: 'バリエーションは1件以上必須です'};
    }

    await Variant.findByIdAndDelete(variantId);
    return { success: true, variant };
}