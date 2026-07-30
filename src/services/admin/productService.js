
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 管理者商品操作処理の業務ロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const { cloudinary } = require('../../cloudinary');

const Product = require('../../models/product');
const Variant = require('../../models/productVariant');
const Review = require('../../models/review');

// 商品の登録
module.exports.createProduct = async (productData, files) => {

    // 画像をループし格納
    const images = files.map(file => { 
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        return {
            url: file.path, 
            filename: file.filename,
            originalName: decodedName,
        }
    });

    // 商品データを登録
    const product = new Product({
        ...productData,
        images
    });
    await product.save();

    // 商品のバリエーションのデフォルトを登録
    const variant = new Variant({
        product: product._id
    });
    await variant.save();

    return { product, variant };
}

// 商品の更新
module.exports.updateProduct = async (productId, productData, files) => {

    // 商品データの画像以外を一度更新する
    const isActive = productData.product.isActive === 'true';
    await Product.findByIdAndUpdate(productId, 
        {
            isActive: isActive,
            name: productData.product.name,
            price: productData.product.price,
            description: productData.product.description,
            category: productData.product.category,
            reviews: productData.product.reviews
        }
    );

    // 画像更新用に商品データを取得する
    product = await Product.findById(productId);
    if (!product) {
        return { success: false, message: '商品が見つかりません'};
    }

    // 画像削除がある場合、DB・Cloudinaryの両方から削除する
    if (productData.deleteImages) {

        // Cloudinary上から削除する
        for (let filename of productData.deleteImages) {
            if (filename) {
                await cloudinary.uploader.destroy(filename);
            }
        }

        // メモリ上から削除する
        product.images = product.images.filter(img => !productData.deleteImages.includes(img.filename));
    }

    // 新しく追加した画像を取得
    const newImages = files.map(file => {

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
    const imageOrder = productData.imageOrder ? JSON.parse(productData.imageOrder) : [];

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
    return { success: true, product };
}

// 商品の削除
module.exports.deleteProduct = async (productId) => {

    const product = await Product.findById(productId);
    if (!product) {
        return{ success: false, message: '対象の商品が見つかりません'};
    }

    // 商品に紐づくバリエーションをすべて削除する
    await Variant.deleteMany({ product: productId });

    // 商品に紐づくレビューをすべて削除する
    await Review.deleteMany({ product: productId });

    // Cloudinary上から画像を削除する
    if (product.images.length > 0) {
        for (let img of product.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }

    // IDに一致するデータを削除
    await Product.findByIdAndDelete(productId);
    return { success: true, product };
}