
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ページングで表示する対象を作成するロジック
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

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