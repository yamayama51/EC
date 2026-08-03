
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | メール送信の補助処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const nodemailer = require('nodemailer');

// 送信の設定
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// メール送信のための関数
module.exports.sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"FAZE OFFICIAL" <' + process.env.EMAIL_USER + '>',
            to: to,
            subject: subject,
            text: text
        });
        console.log('メール送信成功');
    } catch (error) {
        console.log('メール送信失敗');
    }
}