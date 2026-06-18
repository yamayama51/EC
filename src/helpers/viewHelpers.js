
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 画面表示に関わる処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 注文ステータスバッジのクラスを返す
module.exports.getStatusBadge = (status) => {
    const statusMap = {
        pending: 'bg-warning text-dark',
        paid: 'bg-primary text-white',
        arrived: 'bg-success text-white',
        delivered: 'bg-secondary text-white',
        cancelled: 'bg-danger text-white'
    };
    return statusMap[status] || 'bg-secondary';
}