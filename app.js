
// 外部パッケージのインポート
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// モデルの読み込み
const Product = require('./models/product');

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

// TODO:これはなんやねん
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

// TODO:ミドルウェアを定義(あとで切り出す)
const { productSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');


// トップページのルーティング
app.get('/', (req, res) => {
    res.send('トップページ');
});

// 商品のルーティング
// TODO : 後ほどroutesに移動
app.get('/products', async (req, res) => {
    
    // DBから商品一覧を取得
    const products = await Product.find({});

    res.render('products/index', { products });
});

app.get('/products/new', (req, res) => {
    res.render('products/new');
});

app.post('/products', async (req, res) => {

    // リクエストから入力内容を取得
    const product = new Product(req.body.product);
    console.log(product);

    // DBに登録
    await product.save();

    res.redirect(`/products/${product._id}`);
});

app.get('/products/:id', async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await Product.findById(id);

    res.render('products/show', { product });
});

app.put('/products/:id', async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // IDに一致するデータを入力内容に書き換える
    await Product.findByIdAndUpdate(id, {...req.body.product});

    res.redirect(`/products/${product._id}`);
});

app.delete('/products/:id', async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // IDに一致するデータを削除
    await Product.findByIdAndDelete(id);

    res.redirect('/products');
});

app.get('/products/:id/edit', async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await Product.findById(id);

    res.render('products/edit', { product });
});


// ポートを立ち上げる
app.listen(3000, () => {
    console.log('waiting request : port 3000');
});