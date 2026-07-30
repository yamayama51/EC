
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | Userのルーティング管理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const { userSchema } = require('../schemas/schemas');

const { storeReturnTo, validate } = require('../middlewares/middlewares');

// ユーザー登録
router.route('/register')
    .get(userController.renderRegister)
    .post(storeReturnTo, validate(userSchema), userController.register)

// ログイン
router.route('/login')
    .get(userController.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userController.login)

// ログアウト
router.route('/logout')
    .get(userController.logout)

module.exports = router;