
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者用のDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { array } = require('joi');
const { cloudinary } = require('../cloudinary');
const { format } = require('date-fns');

const Product = require('../models/product');
const Variant = require('../models/productVariant');
const Review = require('../models/review');
const Category = require('../models/category');
const Order = require('../models/order');

const { getPaginationData } = require('../helpers/pagination');
const { sendEmail } = require('../helpers/mailer');
const templates = require('../config/mailTemplate');
const { ORDER_STATUS_VALUES, PRODUCT_SIZES_CONFIG, PRODUCT_SIZES_VALUES } = require('../constants/index');

const catchAsync = require('../helpers/catchAsync');

// ログ出力用
const logger = require('../helpers/logger');
const logMsg = require('../constants/logMessage');

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
module.exports.productIndex = catchAsync(async (req, res) => {

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
module.exports.renderProductNewForm = (req, res) => {

    res.render('admin/products/new');
}

// 商品編集画面表示
module.exports.renderProductEditForm = catchAsync(async (req, res) => {

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


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 商品バリエーションのCRUD
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 商品に紐づくバリエーションの一覧取得
module.exports.variantIndex = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;

    // 商品を取得
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // バリエーションを取得
    const variants = await Variant.find({ product: id }).sort({ sizeOrder: 1 });
    if (!variants) {
        req.flash('error', '対象のバリエーションが見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    res.render('admin/variants/index', { id, product, variants });
});

// バリエーション編集画面取得
module.exports.renderVariantEditForm = catchAsync(async (req, res) => {

    // URLから商品ID、バリエーションIDを取得
    const { id, variantId } = req.params;

    // 商品を取得
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', '対象の商品が見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // バリエーションを取得
    const variant = await Variant.findById(variantId);
    if (!variant) {
        req.flash('error', '対象のバリエーションが見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    res.render('admin/variants/edit', { id, product, variant });
});

// バリエーションの登録
module.exports.createVariant = catchAsync(async (req, res) => {

    // URLから商品のIDを取得
    const { id } = req.params;

    logger.info(logMsg.ADMIN_VARIANT.CREATE_SATRT,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id
        }
    );

    try {
        // サイズに応じて順番をつける
        const sizeInput = req.body.variant.size;
        console.log(sizeInput);

        // 定数から対応する順番を取得
        const sizeOrder = PRODUCT_SIZES_CONFIG[sizeInput]?.order ?? 99;
        console.log(sizeOrder);

        const variant = new Variant({
            product: id,
            size: sizeInput,
            sizeOrder: sizeOrder,
        });
        console.log(variant);

        await variant.save();

        logger.info(logMsg.ADMIN_VARIANT.CREATE_END,
            { 
                path: req.path, 
                userId: req.user._id, 
                username: req.user.username,
                productId: id,
                variantId: variant._id
            }
        );

        req.flash('success', '商品バリエーションを登録しました');

        res.redirect(`/admin/products/${id}/variants`);
    } catch (err) {
        if (err.code === 11000) {
            req.flash('error', 'そのサイズは既に登録されています');
            return res.redirect(`/admin/products/${id}/variants`);
        }
    }
});

// バリエーションの編集
module.exports.updateVariant = catchAsync(async (req, res) => {

    // URLから商品のID、バリエーションIDを取得
    const { id, variantId } = req.params;

    logger.info(logMsg.ADMIN_VARIANT.UPDATE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: variantId
        }
    );

    try {
        // バリエーションを取得
        let variant = await Variant.findById(variantId);
        if (!variant) {
            req.flash('error', '対象のバリエーションが見つかりません');
            return res.redirect(`/admin/products/${id}/variants`);
        }

        // リクエスト内容に書き換え
        variant.size = req.body.variant.size;
        
        await variant.save();

        logger.info(logMsg.ADMIN_VARIANT.UPDATE_END,
            { 
                path: req.path, 
                userId: req.user._id, 
                username: req.user.username,
                productId: id,
                variantId: variantId
            }
        );

        req.flash('success', '商品バリエーションを更新しました');

        res.redirect(`/admin/products/${id}/variants`);
    } catch (err) {
        if (err.code === 11000) {
            req.flash('error', 'そのサイズは既に登録されています');
            return res.redirect(`/admin/products/${id}/variants`);
        }
    }
});

// バリエーションの削除
module.exports.deleteVariant = catchAsync(async (req, res) => {

    // URLから商品のID、バリエーションIDを取得
    const { id, variantId } = req.params;

    logger.info(logMsg.ADMIN_VARIANT.DELETE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: variantId
        }
    );

    let variant = await Variant.findById(variantId);
    if (!variant) {
        req.flash('error', '対象のバリエーションが見つかりません');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // 対象商品に紐づくバリエーションの個数を調べる
    const variantCount = await Variant.countDocuments({ product: id });
    
    // 1件の場合削除不可
    if (variantCount === 1) {
        req.flash('error', 'バリエーションは1件以上必須です');
        return res.redirect(`/admin/products/${id}/variants`);
    }

    // 対象カテゴリーを削除する
    variant = await Variant.findByIdAndDelete(variantId);

    logger.info(logMsg.ADMIN_VARIANT.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            productId: id,
            variantId: variantId
        }
    );

    req.flash('success', 'バリエーションを削除しました');
    res.redirect(`/admin/products/${id}/variants`);

});


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | カテゴリーのCRUD
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// カテゴリー一覧取得
module.exports.categoryIndex = catchAsync(async (req, res) => {

    // カテゴリー一覧を取得
    const categories = await Category.find({});

    res.render('admin/categories/index', { categories });
});

// カテゴリー編集画面取得
module.exports.renderCategoryEditForm = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    
    // IDからカテゴリーを一件取得
    const category = await Category.findById(id);
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    res.render('admin/categories/edit', { category });
});

// カテゴリー作成処理
module.exports.createCategory = catchAsync(async (req, res) => {

    logger.info(logMsg.ADMIN_CATEGORY.CREATE_SATRT,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
        }
    );

    // リクエストからcategoryを作成
    const category = new Category(req.body.category);

    // categoryをDBに保存
    await category.save();

    logger.info(logMsg.ADMIN_CATEGORY.CREATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    req.flash('success', 'カテゴリーを追加しました');
    res.redirect('/admin/categories');
});

// カテゴリー編集
module.exports.updateCategory = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    let category = await Category.findById(id);

    logger.info(logMsg.ADMIN_CATEGORY.UPDATE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    // 対象カテゴリーを更新する
    category = await Category.findByIdAndUpdate(id, { name: req.body.category.name });
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    logger.info(logMsg.ADMIN_CATEGORY.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    req.flash('success', 'カテゴリーを更新しました');
    res.redirect('/admin/categories');
});

// カテゴリー削除
module.exports.deleteCategory = catchAsync(async (req, res) => {

    // URLからIDを取得
    const { id } = req.params;
    let category = await Category.findById(id);

    logger.info(logMsg.ADMIN_CATEGORY.DELETE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    // 対象カテゴリーに紐づく商品の有無を調べる
    const productCount = await Product.countDocuments({ category: id });
    
    // 1件でもあれば削除不可
    if (productCount > 0) {
        req.flash('error', '対象のカテゴリーは使用されているため削除できません');
        return res.redirect('/admin/categories');
    }

    // 対象カテゴリーを削除する
    category = await Category.findByIdAndDelete(id);
    if (!category) {
        req.flash('error', '対象のカテゴリーが見つかりません');
        return res.redirect('/admin/categories');
    }

    logger.info(logMsg.ADMIN_CATEGORY.DELETE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            categoryId: category._id
        }
    );

    req.flash('success', 'カテゴリーを削除しました');
    res.redirect('/admin/categories');
});


// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 注文管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 注文一覧を表示
module.exports.ordersIndex = catchAsync(async (req, res) => {

    // フィルター条件を取得
    const statusFilter = req.query.status;

    // ステータスがあればクエリを組み立てる
    const query = statusFilter ? { status: statusFilter } : {};

    // 注文の総数を取得
    const totalItemsCount = await Order.countDocuments(query);

    // ページングに必要なデータを集める
    const pagination = getPaginationData(req.query.page, totalItemsCount);

    // ページ数からlimit件分の注文データを取得
    const orders = await Order.find(query)
        .populate('items.variantId')
        .populate('user')
        .skip((pagination.currentPage - 1) * pagination.LIMIT)
        .limit(pagination.LIMIT)
        .sort({ createdAt: -1})
    ;

    res.render('admin/orders/index', { 
        ORDER_STATUS_VALUES,
        currentStatus: statusFilter,
        orders,
        format,
        pagination,
        baseUrl: 'orders',
        queryParams: statusFilter ? `&status=${statusFilter}` : ''
    });
});

// 注文ステータスの変更
module.exports.updateOrderStatus = catchAsync(async (req, res) => {

    // URLからオーダーIDを取得
    const { orderId } = req.params;

    // 入力値を取得
    const { status } = req.body;

    // 更新前のステータスを取得
    const existingOrder = await Order.findById(orderId);
    const oldStatus = existingOrder.status;

    logger.info(logMsg.ADMIN_ORDER_STATUS.UPDATE_START,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            orderId: orderId,
            oldStatus: oldStatus,
            requestStatus: status
        }
    );

    // 許可されたステータスを取得
    const validStatues = ORDER_STATUS_VALUES;

    // 許可されたステータス以外ならエラー
    if (!validStatues.includes(status)) {
        req.flash('error', '無効なステータスです');
        return res.redirect('/admin/orders');
    }

    // 対象オーダーのステータスを更新
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });

    logger.info(logMsg.ADMIN_ORDER_STATUS.UPDATE_END,
        { 
            path: req.path, 
            userId: req.user._id, 
            username: req.user.username,
            orderId: orderId,
            oldStatus: oldStatus,
            newStatus: updatedOrder.status
        }
    );

    if (!templates[status]) {
        console.error(`Error: Template for status "${status}" not found.`);
        throw new Error(`ステータス "${status}" に対応するメールテンプレートが見つかりません`);
    }

    // メール用のデータを取得
    const data = {
        username: req.user.username,
        orderNumber: updatedOrder.orderNumber,
    }

    // 注文確定のメールフォーマットを取得
    const template = templates[status](data);

    // 注文完了メールを送信する
    await sendEmail(req.user.email, template.subject, template.body);

    req.flash('success', '注文ステータスを更新しました');
    res.redirect('/admin/orders');
});
