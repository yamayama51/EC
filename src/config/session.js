
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | セッション情報
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const session = require('express-session');

// sessionの設定
module.exports = session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});