
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ユーザーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const User = require('../models/user');
const Cart = require('../models/cart');
const cartService = require('../services/cartService');

const catchAsync = require('../helpers/catchAsync');
const logger = require('../helpers/logger');
const logMsg = require('../constants/logMessage');

// ユーザー登録画面表示
module.exports.renderRegister = (req, res) => {

    res.render('users/register');
}

// ユーザー登録処理
module.exports.register = catchAsync(async (req, res, next) => {

    try{

        logger.info(logMsg.USER.CREATE_START,
            { 
                path: req.path,
            }
        );

        // ユーザー情報を取得
        const { email, password, username } = req.body;

        // ユーザーを作成
        const user = new User({ email, username });

        // 登録処理
        const registeredUser = await User.register(user, password);

        // ユーザーの登録時に対象ユーザーのカートを作成する
        const cart = new Cart({ user: registeredUser._id, items: [] });
        await cart.save();

        logger.info(logMsg.USER.CREATE_END,
            { 
                path: req.path,
                userId: registeredUser._id,
                username: registeredUser.username
            }
        );

        // ログイン処理
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'FAZE. へようこそ');
            
            // リダイレクト先を変更
            const redirectUrl = res.locals.returnTo || '/';
            delete res.locals.returnTo;

            res.redirect(redirectUrl);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

// ログイン画面表示
module.exports.renderLogin = (req, res) => {

    res.render('users/login');
}

// ログイン処理
module.exports.login = catchAsync(async (req, res) => {

    logger.info(logMsg.USER.LOGIN,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        }
    );
        
    req.flash('success', `${req.user.username} さん おかえりなさい`);

    // リダイレクト先を変更
    const redirectUrl = res.locals.returnTo || '/';
    delete res.locals.returnTo;

    res.redirect(redirectUrl);
});

// ログアウト処理
module.exports.logout = (req, res, next) => {

    if (!req.user) {
        res.redirect('/');
    }

    logger.info(logMsg.USER.LOGOUT,
        { 
            path: req.path,
            userId: req.user._id,
            username: req.user.username,
        }
    );

    req.logout((err) => {
        if (err) {
            return next();
        }
        req.flash('success', 'ログアウトしました');
        return res.redirect('/');
    });
}