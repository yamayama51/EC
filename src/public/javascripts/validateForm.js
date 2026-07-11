
// バリデーションチェックを通過しない場合、submitできないようにする
// Bootstrap v5.3 Forms.Validation からソースを取得

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('form');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {

      const button = form.querySelector('button[type="submit"]');
      const isValidatedForm = form.classList.contains('validated-form');
      const originalText = button ? button.innerText : '送信';

      // バリデーションチェック
      if (isValidatedForm && !form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');

        if (button) {
          button.disabled = false;
          button.innerText = originalText;
        }
        return;
      }

      // 送信OKなのでボタンを無効化
      if (button) {
        button.disabled = true;
        button.innerText = '処理中...';
      }

      form.classList.add('was-validated')
    }, false);

    // 戻るボタン対策
    window.addEventListener('pageshow', (event) => {
      // キャッシュから復帰した場合のみボタンをリセット
      const buttons = document.querySelectorAll('button[type="submit"]');
      buttons.forEach(btn => {
        if (btn.disabled) {
          btn.disabled = false;
          btn.innerText = btn.getAttribute('data-original-text') || '送信';
        }
      });
    });
  })
})()