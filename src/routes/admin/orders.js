
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者の注文ルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();

const orders = require('../../controllers/admin/orders');

// 注文一覧の取得
router.route('/')
    .get(orders.index)

// 注文ステータスの変更
router.route('/:orderId/update-status')
    .put(orders.updateOrderStatus)

module.exports = router;