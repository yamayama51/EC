
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用の商品のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { cloudinary } = require('../../cloudinary');

const Product = require('../../models/product');
const Variant = require('../../models/productVariant');
const Review = require('../../models/review');
const Category = require('../../models/category');
const Cart = require('../../models/cart');

const { getPaginationData } = require('../../helpers/pagination');
const catchAsync = require('../../helpers/catchAsync');
const logger = require('../../helpers/logger');
const logMsg = require('../../constants/logMessage');


// 商品一覧表示
module.exports.index = catchAsync(async (req, res) => {

    // フィルター適用
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
    const totalItemsCount = await Product.countDocuments(query);

    // ページングに必要なデータを集める
    const pagination = getPaginationData(req.query.page, totalItemsCount);

    // DB検索
    // ページ数からlimit件分の商品データを取得
    const products = await Product.find(query)
        .populate('category')
        .skip((pagination.currentPage - 1) * pagination.LIMIT)
        .limit(pagination.LIMIT)
    ;

    res.render('admin/products/index',
        {
            categories: await Category.find({}),
            products,
            categoryName,
            pagination,
            baseUrl: 'products',
            queryParams: categoryName ? `&category=${encodeURIComponent(categoryName)}` : ''
        }
    );
});

// 商品登録画面表示
module.exports.renderNewForm = (req, res) => {

    res.render('admin/products/new');
}

// 商品編集画面表示
module.exports.renderEditForm = catchAsync(async (req, res) => {

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
});

// 商品登録処理
module.exports.createProduct = catchAsync(async (req, res) => {

    logger.info(logMsg.ADMIN_PRODUCT.CREATE_SATRT,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username
        }
    );

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

    // 商品のバリエーションのデフォルトを登録
    const variant = new Variant({
        product: product._id
    });
    await variant.save();

    logger.info(logMsg.ADMIN_PRODUCT.CREATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: product._id,
            variantId: variant._id
        }
    );

    req.flash('success', '商品を登録しました');

    res.redirect(`/admin/products/${product._id}/edit`);
});

// 商品更新処理
module.exports.updateProduct = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    let product = await Product.findById(id);

    logger.info(logMsg.ADMIN_PRODUCT.UPDATE_SATRT,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username,
            productId: product._id
         }
    );

    console.log(req.body);

    // 商品データの画像以外を一度更新する
    const isActive = req.body.product.isActive === 'true';
    await Product.findByIdAndUpdate(id, 
        {
            isActive: isActive,
            name: req.body.product.name,
            price: req.body.product.price,
            description: req.body.product.description,
            category: req.body.product.category,
            reviews: req.body.product.reviews
        }
    );

    // 画像更新用に商品データを取得する
    product = await Product.findById(id);
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

    logger.info(logMsg.ADMIN_PRODUCT.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: product._id 
        }
    );

    req.flash('success', '商品を更新しました');

    res.redirect(`/products/${product._id}`);
});

// 商品削除処理
module.exports.deleteProduct = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 商品データを取得
    const product = await Product.findById(id);

    logger.info(logMsg.ADMIN_PRODUCT.DELETE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: product._id 
        }
    );

    // 商品が見つからない場合は、商品一覧へ戻る
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect('/admin/products');
    }

    // 商品に紐づくバリエーションをすべて削除する
    await Variant.deleteMany({ product: id });

    // 商品に紐づくレビューをすべて削除する
    await Review.deleteMany({ product: id });

    // Cloudinary上から画像を削除する
    if (product.images.length > 0) {
        for (let img of product.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }

    // IDに一致するデータを削除
    await Product.findByIdAndDelete(id);

    logger.info(logMsg.ADMIN_PRODUCT.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: product._id 
        }
    );

    req.flash('success', '商品を削除しました');

    res.redirect('/admin/products');
});