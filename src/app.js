
// express を使用
const express = require('express');
const app = express();

// 依存先をまとめる
const methodOverride = require('method-override');
const sessionConfig = require('./config/session');
const passport = require('./config/passport');
const flash = require('connect-flash');
const ExpressError = require('./exceptions/ExpressError');
const logger = require('./helpers/logger');
const { setLocals } = require('./middlewares/middlewares');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

// viewEngineの設定
const path = require('path');
require('./config/viewEngine')(app, path.join(__dirname, 'views'));

// 静的ファイルのパス設定
app.use(express.static(path.join(__dirname, 'public')));

// 解析系ミドルウェア
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// セッションの設定
app.use(sessionConfig);

// パスポートの設定(セッションと認証)
app.use(passport.initialize());
app.use(passport.session());

// flash の使用
app.use(flash());

// アプリ共通
app.use(setLocals);

// トップページのルーティング
app.get('/', (req, res) => {
    res.render('pages/home');
});

// ルーティングの設定
app.use('/', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/products/:productId/reviews', reviewRoutes);

// ページが見つからない場合
app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした'), 404);
});

// エラー処理
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = '問題が発生しました';
    logger.error(`${err.message} (Status: ${statusCode})`, { path: req.path, stack: err.stack });
    res.status(statusCode).render('error', { err });
});

module.exports = app;
