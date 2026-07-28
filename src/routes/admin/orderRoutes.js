
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者の注文ルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const orderController = require('../../controllers/admin/orderController');

// 注文一覧の取得
router.route('/')
    .get(orderController.index)

// 注文ステータスの変更
router.route('/:orderId/update-status')
    .put(orderController.updateOrderStatus)

module.exports = router;