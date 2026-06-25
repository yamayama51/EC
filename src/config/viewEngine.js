
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | viewEngine の設定
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const ejsMate = require('ejs-mate');

module.exports = (app, viewPath) => {
    // ejsを使用できるようにする
    app.engine('ejs', ejsMate);
    app.set('view engine', 'ejs');
    app.set('views', viewPath);
}