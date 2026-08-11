
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | メール送信処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { sendEmail } = require('../helpers/mailer');
const templates = require('../config/mailTemplate');

// 注文確定時のメール送信
module.exports.sendOrderPlacedEmail = async (toUser, order) => {

    // メール用のデータを取得
    const data = {
        username: toUser.username,
        orderNumber: order.orderNumber,
        amount : order.totalPrice,
        orderId: order._id
    }

    // 注文確定のメールフォーマットを取得
    const template = templates.placed(data);

    // 注文完了メールを送信する
    await sendEmail(toUser.email, template.subject, template.body);
}

// 注文確定時管理者への通知メール送信
module.exports.sendAdminNotificationEmail = async (toUser, order) => {

    // メール用のデータを取得
    const data = {
        username: toUser.username,
        email: toUser.email,
        orderNumber: order.orderNumber,
        amount : order.totalPrice,
        orderId: order._id
    }

    // 注文確定のメールフォーマットを取得
    const template = templates.adminPlaced(data);
    const adminEmail = process.env.ADMIN_EMAIL

    // 注文完了メールを送信する
    await sendEmail(adminEmail, template.subject, template.body);
}

// 注文ステータス変更時のメール送信
module.exports.sendUpdateStatusEmail = async (toUser, status, updatedOrder) => {

    if (!templates[status]) {
        console.error(`Error: Template for status "${status}" not found.`);
        throw new Error(`ステータス "${status}" に対応するメールテンプレートが見つかりません`);
    }

    // メール用のデータを取得
    const data = {
        username: toUser.username,
        orderNumber: updatedOrder.orderNumber,
        orderId: updatedOrder._id
    }

    // 注文確定のメールフォーマットを取得
    const template = templates[status](data);

    // 注文完了メールを送信する
    await sendEmail(toUser.email, template.subject, template.body);
}