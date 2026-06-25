
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | サーバーの立ち上げ処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// DBに接続できたらサーバーを立ち上げる
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`サーバー起動： http://localhost:${PORT}`);
    });
});