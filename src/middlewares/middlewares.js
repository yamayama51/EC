
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ミドルウェア
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const ExpressError = require('../exceptions/ExpressError');

const Review = require('../models/review');
const Category = require('../models/category');

const catchAsync = require('../helpers/catchAsync');
const { getStatusBadge } = require('../helpers/viewHelpers');

// ログイン状態を確認
module.exports.isLoggedIn = (req, res, next) => {
    
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        console.log('ログインしてください');
        return res.redirect('/login');
    }
    next();
}

// 未ログインユーザーがログインユーザーしか使用できない機能を触ろうとした用
// 現在のURLを一時的に保存する
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// 管理者かどうかを確認
module.exports.isAdmin = (req, res, next) => {

    if (!req.user || !req.user.isAdmin) {
        console.log('権限がありません');
        return res.redirect('/products')
    }
    next();
}

// レビューの著者かどうかを確認
module.exports.isReviewAuthor = catchAsync(async (req, res, next) => {

    // URLからレビューIDを取得
    const { productId, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'そのアクションの権限がありません');
        return res.redirect(`/products/${productId}`);
    }
    next();
});

// res.locals に値をセットする
module.exports.setLocals = catchAsync(async (req, res, next) => {

    // flashの設定
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    // ユーザー情報を利用可能にする
    res.locals.currentUser = req.user;

    // カテゴリーの設定
    res.locals.categories = await Category.find({});

    // 商品サイズの設定
    const { PRODUCT_SIZES_VALUES } = require('../constants/index');
    res.locals.sizes = PRODUCT_SIZES_VALUES;

    // ejsで動的にクラスを変更するための処理の設定
    res.locals.getStatusBadge = getStatusBadge;

    next();
});

// スキーマを受け取りバリデーションチェックをする
module.exports.validate = (schema) => {

    return (req, res, next) => {
        
        // FilePondの特性上、req.bodyのimagesはurlの文字列のみが送られてくる
        // Joiに合わせた構造に変える
        if (req.body.product && req.body.product.images) {
            
            // 1枚だけのときは配列に包む
            if (!Array.isArray(req.body.product.images)) {
                req.body.product.images = [req.body.product.images];
            }

            // URL文字列を、{ url, filename } のオブジェクトに変換
            req.body.product.images = req.body.product.images.map(img => {
                if (typeof img === 'string') {

                    // URLから filename ("EC/xxxx") を自動抽出
                    const parts = img.split('/');
                    const folder = parts[parts.length - 2]; 
                    const fileWithExt = parts[parts.length - 1]; 

                    // 拡張子部分を消す
                    const filenameWithoutExt = fileWithExt.split('.')[0]; 
                    
                    return {
                        url: img,
                        filename: `${folder}/${filenameWithoutExt}`
                    };
                }
                return img;
            });
        }

        const { error } = schema.validate(req.body);
        if (error) {
            const msg = error.details.map(detail => detail.message).join(', ');
            throw new ExpressError(msg, 400);
        } else {
            next();
        }
    }
}

