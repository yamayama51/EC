
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者のカテゴリールーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const categories = require('../../controllers/admin/categoryController');
const { categorySchema } = require('../../schemas/schemas');

const { validate } = require('../../middlewares/middlewares');

// カテゴリー一覧
router.route('/')
    .get(categories.index)
    .post(validate(categorySchema), categories.createCategory)

// カテゴリー詳細
router.route('/:id')
    .put(validate(categorySchema), categories.updateCategory)
    .delete(categories.deleteCategory)

// カテゴリー編集
router.route('/:id/edit')
    .get(categories.renderEditForm)

module.exports = router;