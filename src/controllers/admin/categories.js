
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用のカテゴリーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Category = require('../../models/category');

const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');

// カテゴリー一覧取得
module.exports.index = catchAsync(async (req, res) => {

    // カテゴリー一覧を取得
    const categories = await Category.find({});

    res.render('admin/categories/index', { categories });
});

// カテゴリー編集画面取得
module.exports.renderEditForm = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    
    // IDからカテゴリーを一件取得
    const category = await Category.findById(id);
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    res.render('admin/categories/edit', { category });
});

// カテゴリー作成処理
module.exports.createCategory = catchAsync(async (req, res) => {

    logger.info(logMsg.ADMIN_CATEGORY.CREATE_SATRT,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
        }
    );

    // リクエストからcategoryを作成
    const category = new Category(req.body.category);

    // categoryをDBに保存
    await category.save();

    logger.info(logMsg.ADMIN_CATEGORY.CREATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    req.flash('success', 'カテゴリーを追加しました');
    res.redirect('/admin/categories');
});

// カテゴリー編集
module.exports.updateCategory = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    let category = await Category.findById(id);

    logger.info(logMsg.ADMIN_CATEGORY.UPDATE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    // 対象カテゴリーを更新する
    category = await Category.findByIdAndUpdate(id, { name: req.body.category.name });
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    logger.info(logMsg.ADMIN_CATEGORY.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    req.flash('success', 'カテゴリーを更新しました');
    res.redirect('/admin/categories');
});

// カテゴリー削除
module.exports.deleteCategory = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    let category = await Category.findById(id);

    logger.info(logMsg.ADMIN_CATEGORY.DELETE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    // 対象カテゴリーに紐づく商品の有無を調べる
    const productCount = await Product.countDocuments({ category: id });
    
    // 1件でもあれば削除不可
    if (productCount > 0) {
        req.flash('error', '対象のカテゴリーは使用されているため削除できません');
        return res.redirect('/admin/categories');
    }

    // 対象カテゴリーを削除する
    category = await Category.findByIdAndDelete(id);
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    logger.info(logMsg.ADMIN_CATEGORY.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    req.flash('success', 'カテゴリーを削除しました');
    res.redirect('/admin/categories');
});

