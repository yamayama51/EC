
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カテゴリーのモデルを作成
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({

    name: {
        type: String,
        required: [true, 'カテゴリー名は必須です'],
        unique: true,
        trim: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);