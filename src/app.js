
// プロダクション環境（本番環境）以外の場合に .env を読み込む設定
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// 外部パッケージのインポート
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const ExpressError = require('./exceptions/ExpressError');
const { PRODUCT_CATEGORIES } = require('./constants/index');

// モデルの読み込み
const User = require('./models/user');

// ルートの読み込み
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

// DBの接続先
const dbUrl = 'mongodb://localhost:27017/my-fashin-store';

// DBに接続
mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDB : connection success');
    })
    .catch((err) => {
        console.log('MongoDB : connection error');
        console.log(err);
    }
);

// expressを使用可能にする
const app = express();

// ejsを使用できるようにする
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// リクエスト結果をreq.bodyに入れるための処理
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// sessionの設定
const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));

// パスポートの設定
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

// ejs内で変数を利用できるようにする
app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    // ユーザー情報を利用可能にする
    res.locals.currentUser = req.user;

    res.locals.categories = PRODUCT_CATEGORIES;

    next();
});

// トップページのルーティング
app.get('/', (req, res) => {
    res.send('トップページ');
});

// ルーティングの設定
app.use('/', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/products/:productId/reviews', reviewRoutes);

// ページが見つからない場合
app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした'), 404);
});

// エラー処理
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = '問題が発生しました';
    res.status(statusCode).render('error', { err });
});

// ポートを立ち上げる
app.listen(3000, () => {
    console.log('waiting request : port 3000');
});