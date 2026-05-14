
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
        name: 'Sample',
        price: 2900,
        description: 'サンプルなTシャツです',
        category: 'Tops',
        images: [
            {
                url: 'https://msp.c.yimg.jp/images/v2/FUTi93tXq405grZVGgDqG1kFgzUBi2vigmURnXfA8Oa5dhGWQvPv2omry_8w0T0g4if65YNL4RWdPLZQsLEBLVkIJVeDAFLwBjaZO7fM-JsX8AX3qh-9DSXgfibyHETgrtvQGdN0sJvM-MC0TacXuA2Ycm_Zx_TOBZLXvYlpOYV-rdmS-JDkd7d-jpzP83NdB-IXrLqD5b7zKN7S0Lx9LrXBVhPsaNQlzRJ8icKM4SaqFkw_Pp_8OfDqWYxuTuT3sy-uHy6zmxeUlKENdYjQmvWAzgenNmvh6r_uHynO9bI=/475535f42bb6850395e2c6b606e5d5fc_t.jpeg',
                filename: 'EC/sample_id'
            }
        ],
        stock: 10,
    },
    {
        name: 'デニムパンツ',
        price: 5900,
        description: 'かっこいいデニムです',
        category: 'Bottoms',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1714729382668-7bc3bb261662?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                filename: 'EC/denim'
            },
            {
                url: 'https://msp.c.yimg.jp/images/v2/FUTi93tXq405grZVGgDqG6_VdxMrNi597x-gVA8KCYemUZrtyxSIchsIwp4mC96w2fdEeGQq8_FCNYt1jVkXuxYIkKJtRNzMjzDJx-4fQ3G2qFpiSi5FRHJUyGZJuNs4HoNtb7gyWFe2pu89Qc6CuvNnUnC0Sl0TgTWv1Cp-nAlILgpq_Bl_f14bfxCAnEhWE5_CjMUdPB-aKXBlzFsejzLZxiC1pZfxdIW2eDQM6EjOqNrHdsMbmka7wdrHMm61/NF5137EU000329_1_l.jpg?errorImage=false',
                filename: 'EC/denim2'
            }
        ],
        stock: 10,
    },
    {
        name: 'スニーカー',
        price: 9800,
        description: 'いい感じのスニーカーです',
        category: 'Shoes',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                filename: 'EC/shoes'
            }
        ],
        stock: 10,
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
