
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ユーザーのDB処理・htmlの表示等(処理系)
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const User = require('../models/user');

// ユーザー登録画面表示
module.exports.renderRegister = (req, res) => {

    res.render('users/register');
}

// ユーザー登録処理
module.exports.register = async (req, res) => {

    try{
        // ユーザー情報を取得
        const { email, username, password } = req.body;

        // ユーザーを作成
        const user = new User({ email, username });

        // 登録処理
        const registeredUser = await User.register(user, password);

        // ログイン処理
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'My-Styleへようこそ');
            res.redirect('/products');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

// ログイン画面表示
module.exports.renderLogin = (req, res) => {

    res.render('users/login');
}

// ログイン処理
module.exports.login = (req, res) => {

    req.flash('success', 'おかえりなさい');
    res.redirect('/products');
}

// ログアウト処理
module.exports.logout = (req, res) => {

    req.logout((err) => {
        if (err) {
            return next();
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/products');
    });
}