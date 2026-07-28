
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者のカテゴリールーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const categoryController = require('../../controllers/admin/categoryController');
const { categorySchema } = require('../../schemas/schemas');

const { validate } = require('../../middlewares/middlewares');

// カテゴリー一覧
router.route('/')
    .get(categoryController.index)
    .post(validate(categorySchema), categoryController.createCategory)

// カテゴリー詳細
router.route('/:id')
    .put(validate(categorySchema), categoryController.updateCategory)
    .delete(categoryController.deleteCategory)

// カテゴリー編集
router.route('/:id/edit')
    .get(categoryController.renderEditForm)

module.exports = router;