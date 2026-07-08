
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | DB接続
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');

// ログ出力用
const logger = require('../helpers/logger');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/Faze';

        await mongoose.connect(uri);
        console.log('MongoDBに正常に接続されました');
    } catch (err) {
        logger.error('MongoDB接続エラー', { stack: err.stack });
        process.exit(1);
    }
}

module.exports = connectDB;