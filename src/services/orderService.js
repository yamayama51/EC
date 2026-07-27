
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カート操作処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Order = require('../models/order');
const Cart = require('../models/cart');
const cartService = require('../services/cartService');

const { MAX_PRODUCT_QTY } = require('../constants/index');

// ユーザーIDに一致するオーダー一覧を返す
module.exports.getOrderListByUserId = async (userId) => {

    // ユーザーに一致するオーダー情報を取得
    const orders = await Order.find({ user: userId })
        .populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: {
                path: 'product',
                model: 'Product'
            }
        })
        .sort({ createdAt: -1 }
    );

    return orders;
}

// オーダー1件の詳細取得
module.exports.getOrderById = async (orderId) => {

    const order = await Order.findById(orderId)
        .populate({
            path: 'items.variantId',
            model: 'ProductVariant',
            populate: { 
                path: 'product',
                model: 'Product'
            }
        }
    );

    return order;
}

// オーダーの作成
module.exports.createOrder = async (userId, cart) => {

    // カート内のアイテム情報を取得する
    const { orderItems, total } = await cartService.formatCartForOrder(cart);

    // Orderの番号を作成
    const orderNumber = await module.exports.generateOrderNumber();

    // オーダーの作成
    const order = new Order({
        user: userId,
        items: orderItems,
        totalPrice: total,
        orderNumber: orderNumber
    });
    await order.save();

    // カートを空にして保存
    cart.items = [];
    await cart.save();

    return order;
}

// 注文アイテム数の上限判定
module.exports.validateItemQuantities = (cart) => {

    for (let item of cart.items) {
        if (item.quantity > MAX_PRODUCT_QTY) {
            return {
                isValid: false,
                message: `一度に注文できるのは${MAX_PRODUCT_QTY}個までです`
            }
        }
    }

    return {
        isValid: true,
        message: null
    };
}

// 注文番号を発番する
module.exports.generateOrderNumber = async () => {

    try {
    
        // 日本時間の現在時刻を作る
        const now = new Date();
        const offset = 9 * 60 * 60 * 1000;
        const jstDate = new Date(now.getTime() + offset);

        // 日付文字列を作成 ('20260712' の形式)
        const dateStr = jstDate.toISOString().split('T')[0].replace(/-/g, '');

        // 検索用の「今日の0時」と「明日の0時」を日本時間ベースで作る

        const startOfToday = new Date(jstDate);
        startOfToday.setUTCHours(0, 0, 0, 0);

        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);

        // 同日付の連番を取得
        const count = await Order.countDocuments({
            createdAt: {
                $gte: startOfToday,
                $lt: startOfTomorrow
            }
        });

        // 連番を4桁にする
        const sequence = (count + 1).toString().padStart(4, '0');

        return `faze-${dateStr}-${sequence}`;

    } catch (err) {

        console.log('注文番号の採番に失敗しました');
        throw new Error('注文番号の採番に失敗しました');
    }
}