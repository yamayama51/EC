
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 非同期の処理を行うすべての関数内でtry-catchを書かなくてよいようにするため、
// | 関数を受け取り、try-catchを代わりに行う関数
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const catchAsync = function(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(e => { next(e)} );
    }
}

module.exports = catchAsync;