
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { cloudinary } = require('../cloudinary');

const Product = require('../models/product');
const Order = require('../models/order');
const Review = require('../models/review');

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
    const product = await Product.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });

    // 商品が見つからなければ一覧画面へ遷移
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/products');
    }

    // レビュー書込み権限があるかを確認
    let canWriteReview = false;

    // ログインしているかを確認
    if (req.user) {

        // 購入済みかどうかを確認
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            'items.productId': id
        });

        // レビューを投稿済みかを確認
        const hasReview = await Review.findOne({
            author: req.user._id,
            product: id
        });

        // 「購入済み」かつ「レビュー未投稿」なら投稿可能
        if (hasPurchased && !hasReview) {
            canWriteReview = true;
        }
    }

    res.render('products/show', { product, canWriteReview });
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

    // 画像をループし格納
    product.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

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

    // 画像をループし格納
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);

    await product.save();

    // 画像削除がある場合、DB・Cloudinaryの両方から削除する
    if (req.body.deleteImages) {

        // Cloudinary上から削除する
        for (let filename of req.body.deleteImages) {
            if (filename) {
                await cloudinary.uploader.destroy(filename);
            }
        }

        // DB上から削除する
        await Product.findByIdAndUpdate(id, {$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }

    req.flash('success', '商品を更新しました');

    res.redirect(`/products/${product._id}`);
}

// 商品削除処理
module.exports.deleteProduct = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 商品データを取得
    const product = await Product.findById(id);

    // 商品が見つからない場合は、商品一覧へ戻る
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect('/products');
    }

    // 商品に紐づくレビューをすべて削除する
    await Review.deleteMany({ _id: { $in: product.reviews } });

    // Cloudinary上から画像を削除する
    if (product.images.length > 0) {
        for (let img of product.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }

    // IDに一致するデータを削除
    await Product.findByIdAndDelete(id);

    req.flash('success', '商品を削除しました');

    res.redirect('/products');
}