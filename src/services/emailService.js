
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | メール送信処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { sendEmail } = require('../helpers/mailer');
const templates = require('../config/mailTemplate');

module.exports.sendOrderPlacedEmail = async (user, order) => {

    // メール用のデータを取得
    const data = {
        username: user.username,
        orderNumber: order.orderNumber,
        amount : order.totalPrice,
    }

    // 注文確定のメールフォーマットを取得
    const template = templates.placed(data);

    // 注文完了メールを送信する
    await sendEmail('user.email', template.subject, template.body);

}