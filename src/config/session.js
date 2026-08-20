
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | セッション情報
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const session = require('express-session');

// sessionの設定
module.exports = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});