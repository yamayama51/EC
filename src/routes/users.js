
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Userのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const { userSchema } = require('../schemas/schemas');

const { storeReturnTo, validate } = require('../middlewares/middlewares');

// ユーザー登録
router.route('/register')
    .get(users.renderRegister)
    .post(validate(userSchema), users.register)

// ログイン
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// ログアウト
router.route('/logout')
    .get(users.logout)

module.exports = router;