
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const Product = require('../models/product');

// 商品一覧の表示
module.exports.index = async (req, res) => {
    
    // DBから商品一覧を取得
    const products = await Product.find({});

    res.render('products/index', { products });
};

// 商品登録画面表示
module.exports.renderNewForm = (req, res) => {

    res.render('products/new');
}

// 商品詳細画面表示
module.exports.renderShowForm = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await Product.findById(id);

    // 商品が見つからなければ一覧画面へ遷移
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/products');
    }

    res.render('products/show', { product });
}

// 商品編集画面表示
module.exports.renderEditForm = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await Product.findById(id);

    // 商品が見つからなければ一覧画面へ遷移
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/products');
    }

    res.render('products/edit', { product });
}

// 商品登録処理
module.exports.createProduct = async (req, res) => {

    // リクエストから入力内容を取得
    const product = new Product(req.body.product);

    // DBに登録
    await product.save();

    req.flash('success', '商品を登録しました');

    res.redirect(`/products/${product._id}`);
}

// 商品更新処理
module.exports.updateProduct = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // IDに一致するデータを入力内容に書き換える
    const product = await Product.findByIdAndUpdate(id, {...req.body.product});

    req.flash('success', '商品を更新しました');

    res.redirect(`/products/${product._id}`);
}

// 商品削除処理
module.exports.deleteProduct = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // IDに一致するデータを削除
    await Product.findByIdAndDelete(id);

    req.flash('success', '商品を削除しました');

    res.redirect('/products');
}