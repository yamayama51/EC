
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ミドルウェア
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const ExpressError = require('../exceptions/ExpressError');

// ログイン状態を確認
module.exports.isLoggedIn = (req, res, next) => {
    
    if (!req.isAuthenticated()) {
        console.log('ログインしてください');
        return res.redirect('/login');
    }
    next();
}

// 管理者かどうかを確認
module.exports.isAdmin = (req, res, next) => {

    if (!req.user || !req.user.isAdmin) {
        console.log('権限がありません');
        return res.redirect('/products')
    }
    next();
}

// スキーマを受け取りバリデーションチェックをする
module.exports.validate = (schema) => {

    return (req, res, next) => {

        const { error } = schema.validate(req.body);
        if (error) {
            const msg = error.details.map(detail => detail.message).join(', ');
            throw new ExpressError(msg, 400);
        } else {
            next();
        }
    }
}