
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 削除確認モーダルの制御
// | → 削除ボタンが押下時、動的にターゲットIDをフォームに付与する
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 削除モーダルをIDで取得
const deleteModal = document.getElementById('deleteModal');

// ボタンに紐づくIDを取得し、その対象を削除するように紐づける
deleteModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const productId = button.getAttribute('data-id');
    const targetName = button.getAttribute('data-name');
    const form = document.getElementById('deleteForm');
    const deletePath = button.getAttribute('data-url');
    form.action = deletePath;

    const nameDisplay = document.getElementById('targetName');
    nameDisplay.textContent = targetName;
});