
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | 削除確認モーダルの制御
// | → 商品削除ボタンが押下時、動的にターゲットIDをフォームに付与する
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

// 削除モーダルをIDで取得
const deleteModal = document.getElementById('deleteModal');

// ボタンに紐づく商品IDを取得し、その商品を削除するように紐づける
deleteModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const productId = button.getAttribute('data-product-id');
    const productName = button.getAttribute('data-product-name');
    const form = document.getElementById('deleteForm');
    form.action = `/admin/products/${productId}?_method=DELETE`;

    const nameDisplay = document.getElementById('productName');
    nameDisplay.textContent = productName;
});