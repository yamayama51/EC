
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | flashが自動で消えるようにするスクリプト
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

document.addEventListener('DOMContentLoaded', () => {
    const successAlert = document.getElementById('auto-close-alert');

    if (successAlert) {
      setTimeout(() => {
        const bsAlert = new bootstrap.Alert(successAlert);
        bsAlert.close();
      }, 3000);
    }
  });