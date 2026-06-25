
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | passport 設定
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user');

// パスポートの設定
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
