
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { array } = require('joi');
const { cloudinary } = require('../cloudinary');
const { format } = require('date-fns');

const Product = require('../models/product');
const Review = require('../models/review');
const Category = require('../models/category');
const Order = require('../models/order');

const { generatePageRange } = require('../helpers/pagination');
const { ORDER_STATUS } = require('../constants/index');

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者ダッシュボードの表示
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
module.exports.dashboard = (req, res) => {
    res.render('admin/dashboard');
}

// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品のCRUD等
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 商品一覧表示
module.exports.productIndex = async (req, res) => {

    // 指定されたページ番号・表示件数を定義
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    // 検索条件を追加 (カテゴリーのフィルターを適用)
    const categoryName = req.query.category;
    let query = {};

    // カテゴリーのフィルターを適用
    if (categoryName) {

        // 名前からカテゴリーを検索
        const categoryDoc = await Category.findOne({ name: categoryName });

        // カテゴリーが存在すればIDで絞り込む
        if (categoryDoc) {
            query = { category: categoryDoc._id };
        } else {
            query = {};
        }
    }

    // 商品データの総数とページの総数を取得
    const totalProductsCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProductsCount / limit);

    // ページ数からlimit件分の商品データを取得
    const products = await Product.find(query).populate('category').skip((page - 1) * limit).limit(limit);

    // 表示するページを取得
    const finalDisplay = generatePageRange(page, totalPages);

    res.render('admin/products/index',
        {
            products,
            categoryName,
            totalProductsCount,
            currentPage: page,
            from: (page - 1) * limit + 1,
            to: Math.min(page * limit, totalProductsCount),
            totalPages,
            finalDisplay 
        }
    );
}

// 商品登録画面表示
module.exports.renderProductNewForm = (req, res) => {

    res.render('admin/products/new');
}

// 商品編集画面表示
module.exports.renderProductEditForm = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // DBから商品を取得
    const product = await Product.findById(id).populate('category');

    // 商品が見つからなければ一覧画面へ遷移
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/admin/products');
    }

    res.render('admin/products/edit', { product });
}

// 商品登録処理
module.exports.createProduct = async (req, res) => {

    // リクエストから入力内容を取得
    const product = new Product(req.body.product);

    // 画像をループし格納
    product.images = req.files.map(file => { 

        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        
        return {
            url: file.path, 
            filename: file.filename,
            originalName: decodedName,
        }
    });

    // DBに登録
    await product.save();

    req.flash('success', '商品を登録しました');

    res.redirect(`/products/${product._id}`);
}

// 商品更新処理
module.exports.updateProduct = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 商品データの画像以外を一度更新する
    await Product.findByIdAndUpdate(id, 
        {
            name: req.body.product.name,
            price: req.body.product.price,
            description: req.body.product.description,
            category: req.body.product.category,
            reviews: req.body.product.reviews
        }
    );

    // 画像更新用に商品データを取得する
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', '商品が見つかりませんでした');
        return res.redirect('/admin/products');
    }

    // 画像削除がある場合、DB・Cloudinaryの両方から削除する
    if (req.body.deleteImages) {

        // Cloudinary上から削除する
        for (let filename of req.body.deleteImages) {
            if (filename) {
                await cloudinary.uploader.destroy(filename);
            }
        }

        // メモリ上から削除する
        product.images = product.images.filter(img => !req.body.deleteImages.includes(img.filename));
    }

    // 新しく追加した画像を取得
    const newImages = req.files.map(file => {

        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        return { 
            url: file.path, 
            filename: file.filename,
            originalName: decodedName,
        };
    });

    // 既存の画像と新規画像を一つにまとめる
    const allImagesPool = [...product.images, ...newImages];

    // リクエスト内のImageOrderを配列に変換　※中身は送られた全ファイル名の羅列
    const imageOrder = req.body.imageOrder ? JSON.parse(req.body.imageOrder) : [];

    if (imageOrder.length > 0) {

        // ソート用の配列を作成
        const sortedImages = []

        // リクエストのImageOrder順にループを回す
        for (let imageFileName of imageOrder) {

            // プール内からURLまたはファイル名が一致する画像を探す
            const foundImage = allImagesPool.find(img => {

                // Multerで登録されるファイル名 : EC/(ファイルID)
                // FilePondを使用してリクエストを送る際のファイル名 : (ファイルID).拡張子
                // ファイルID部分で比較し、一致する場合に画像を配列にプッシュする

                // imageFileNameからファイルIDだけを取り出す
                const imageFileId = imageFileName.split('.').shift();
            
                // allImagesPoolのfilenameからファイルIDだけを取り出す
                let dbFileId = '';
                if (img.filename) {
                    dbFileId = img.filename.split('/').pop();
                }

                if (imageFileId === dbFileId) return true;
                if (imageFileName === img.originalName) return true;

                return false;
            });

            // 見つかった場合、ソート済み配列にプッシュ
            if (foundImage) {
                sortedImages.push(foundImage);
            }
        }

        // 画像の並び順を上書きする
        product.images = sortedImages;
    } else {

        // imageOrderがない場合は後ろに追加
        product.images = allImagesPool;
    }

    // 保存処理
    await product.save();

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
        return res.redirect('/admin/products');
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

    res.redirect('/admin/products');
}


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カテゴリーのCRUD
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// カテゴリー一覧取得
module.exports.categoryIndex = async (req, res) => {

    // カテゴリー一覧を取得
    const categories = await Category.find({});

    res.render('admin/categories/index', { categories });
}

// カテゴリー編集画面取得
module.exports.renderCategoryEditForm = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    
    // IDからカテゴリーを一件取得
    const category = await Category.findById(id);
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    res.render('admin/categories/edit', { category });
}

// カテゴリー作成処理
module.exports.createCategory = async (req, res) => {

    // リクエストからcategoryを作成
    const category = new Category(req.body.category);

    // categoryをDBに保存
    await category.save();

    req.flash('success', 'カテゴリーを追加しました');
    res.redirect('/admin/categories');
}

// カテゴリー編集
module.exports.updateCategory = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 対象カテゴリーを更新する
    const category = await Category.findByIdAndUpdate(id, { name: req.body.category.name });
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    req.flash('success', 'カテゴリーを更新しました');
    res.redirect('/admin/categories');
}

// カテゴリー削除
module.exports.deleteCategory = async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 対象カテゴリーに紐づく商品の有無を調べる
    const productCount = await Product.countDocuments({ category: id });

    // 1件でもあれば削除不可
    if (productCount > 0) {
        req.flash('error', '対象のカテゴリーは使用されているため削除できません');
        return res.redirect('/admin/categories');
    }

    // 対象カテゴリーを削除する
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    req.flash('success', 'カテゴリーを削除しました');
    res.redirect('/admin/categories');
}


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 注文管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 注文一覧を表示
module.exports.ordersIndex = async (req, res) => {

    // オーダーの一覧を取得
    const orders = await Order.find({})
        .populate('items.productId')
        .populate('user')
        .sort({ createdAt: -1 }
    );

    res.render('admin/orders/index', { ORDER_STATUS, orders, format });
}

// 注文ステータスの変更
module.exports.updateOrderStatus = async (req, res) => {

    // URLからオーダーIDを取得
    const { orderId } = req.params;

    // 入力値を取得
    const { status } = req.body;

    // 許可されたステータスを取得
    const validStatues = Object.values(ORDER_STATUS);

    // 許可されたステータス以外ならエラー
    if (!validStatues.includes(status)) {
        req.flash('error', '無効なステータスです');
        return res.redirect('/admin/orders');
    }

    // 対象オーダーのステータスを更新
    await Order.findByIdAndUpdate(orderId, { status: status });

    req.flash('success', '注文ステータスを更新しました');
    res.redirect('/admin/orders');
}
