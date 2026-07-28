
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カテゴリ操作処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Category = require('../../models/category');
const Product = require('../../models/product');

// カテゴリー一覧の取得
module.exports.getCategoryList = async () => {

    // カテゴリー一覧を取得
    const categories = await Category.find({});

    return categories;
}

// カテゴリー1件取得
module.exports.getCategoryById = async (categoryId) => {

    // カテゴリーを取得
    const category = await Category.findById(categoryId);

    return category;
}

// カテゴリー作成
module.exports.createCategory = async (categoryData) => {
    
    const category = new Category(categoryData);
    await category.save();

    return category;
}

// カテゴリー更新
module.exports.updateCategory = async (categoryId, categoryData) => {

    // 引数で受け取ったカテゴリーデータに更新する
    const category = await Category.findByIdAndUpdate(
        categoryId,
        { name: categoryData.name },
        { new: true }
    );

    return category;
}

// カテゴリー削除
module.exports.deleteCategory = async (categoryId) => {

    // 対象カテゴリーに紐づく商品の有無を調べる
    // MEMO : カテゴリーサービスでプロダクトモデルを扱うのは良いの？
    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
        return { 
            success: false,
            message: '対象のカテゴリーは使用されているため削除できません'
        };
    }

    // 削除処理
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
        return { 
            success: false,
            message: '対象のカテゴリーが見つかりません'
        };
    }

    return { success: true, category};
}