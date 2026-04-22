
// 外部パッケージのインポート
const express = require('express');
const mongoose = require('mongoose');

// expressを使用可能にする
const app = express();

// ルーティングの作成
app.get('/', (req, res) => {
    res.send('yaho-');
});




// ポートを立ち上げる
app.listen(3000, () => {
    console.log('waiting request : port 3000');
});