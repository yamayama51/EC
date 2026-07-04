
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ページング関連の処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 1ページの表示件数
const LIMIT = 20;

// ページングのデータを返す処理
module.exports.getPaginationData = (pageParam, totalItemsCount) => {

    // 指定されたページ数と最大ページ数を取得
    const page = parseInt(pageParam) || 1;
    const totalPages = Math.ceil(totalItemsCount / LIMIT);

    return {
        currentPage: page,
        totalPages,
        totalItemsCount,
        from: (page - 1) * LIMIT + 1,
        to: Math.min(page * LIMIT, totalItemsCount),
        finalDisplay: this.generatePageRange(page, totalPages),
        LIMIT
    }
}

// ページングで表示する対象を作成するロジック
module.exports.generatePageRange = (page, totalPages) => {

    // 範囲の候補を格納する(Setは重複を自動で消す)
    const candidate = new Set();

    // 先頭と末尾を追加
    candidate.add(1);
    candidate.add(totalPages);

    // 現在地の前後を定義
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    // 表示範囲を指定
    for (let i = start; i <= end; i++) {
        candidate.add(i);

        if (start === 1) {
            candidate.add(i + 1);
        }
        if (end === totalPages) {
            candidate.add(i - 1);
        }
    }

    // 範囲候補を昇順に並び替えて格納
    const range = Array.from(candidate)
        .filter(num => num >= 1 && num <= totalPages)
        .sort((a, b) => a - b);

    // ...の文字列を追加
    const finalDisplay = [];
    for (let i = 0; i < range.length; i++) {
        finalDisplay.push(range[i]);

        if (range[i + 1] - range[i] >= 2) {
            finalDisplay.push('...');
        }
    }
    return finalDisplay;
}