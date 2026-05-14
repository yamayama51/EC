
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のシードデータを入れる
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const Product = require('../models/product');

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

// 新しい商品を作る
const seedProducts = [
    {
        name: '白Tシャツ',
        price: 2900,
        description: 'シンプルなTシャツです',
        category: 'tops',
        image: 'https://plus.unsplash.com/premium_photo-1690406382383-3827c1397c48?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        name: 'デニムパンツ',
        price: 5900,
        description: 'かっこいいデニムです',
        category: 'bottoms',
        image: 'https://images.unsplash.com/photo-1714729382668-7bc3bb261662?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        name: 'スニーカー',
        price: 9800,
        description: 'いい感じのスニーカーです',
        category: 'shoes',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
];

// データ登録
const seedDB = async () => {

    // 今のデータを削除
    await Product.deleteMany({});

    // 用意したデータを登録
    await Product.insertMany(seedProducts);
    console.log('データの登録が完了しました');
}

// DBの切断
seedDB().then(() => {
    mongoose.connection.close();
});
