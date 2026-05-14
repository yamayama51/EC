
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 自作エラークラス
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 標準のErrorクラスでは持てないステータスコードを持つために継承する
// Expressでは標準的に使われるカスタムエラークラス

class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
module.exports = ExpressError;