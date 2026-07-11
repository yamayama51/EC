
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者のルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const admin = require('../../controllers/admin/admin');
const { isAdmin } = require('../../middlewares/middlewares');

// 全てのルートにisAdminを適用
router.use(isAdmin);

// 各管理者ルートを取得
const productsRoutes = require('./products');
const productVariantsRoutes = require('./productVariants');
const categoriesRoutes = require('./categories');
const ordersRoutes = require('./orders');

// 管理者ダッシュボード
router.get('/dashboard', admin.dashboard);

// ルーターを適用
router.use('/products', productsRoutes);
router.use('/', productVariantsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);

module.exports = router;