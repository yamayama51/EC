
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | メール送信の補助処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { Resend } = require('resend');

// Resendを使用できるようにする
const resend = new Resend(process.env.RESEND_API_KEY);

// メール送信のための関数
module.exports.sendEmail = async (to, subject, text) => {
    try {
        const data = await resend.emails.send({
            from: `FAZE OFFICIAL <${process.env.MAIL_FROM}>`,
            to: to,
            subject: subject,
            text: text
        });

        console.log('メール送信成功');
    } catch (error) {
        console.log('メール送信失敗');
    }
}
