
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | filepondの設定・処理を追加するためのファイル
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
);

document.addEventListener('DOMContentLoaded', () => {

    // |ーーーーーーーーーーーーーーーーーーーーーーーーー
    // | FilePondの初期設定
    // |ーーーーーーーーーーーーーーーーーーーーーーーーー

    // HTMLからfilepondのインプットを取得し、設定を行う
    const inputElement = document.querySelector('.filepond');

    // フォームの要素を取得
    const form = document.querySelector('form');

    if (!inputElement || !form) return;

    // 既存画像格納用の変数
    let initialFiles = [];

    // 既存の画像URLを読み取る
    const existingFilesData = inputElement.dataset.files;

    // 編集時DB上の画像をFilePondで扱うための変換処理
    if (existingFilesData) {
        const urls = JSON.parse(existingFilesData);
        initialFiles = urls.map(item => {
            const imageUrl = (typeof item === 'object' && item !== null) ? item.url : item;
            
            return {
                source: imageUrl,
                options: { type: 'local' }
            };
        });
    }

    const pond = FilePond.create(inputElement, {

        storeAsFile: true,
        credits: false,

        // 表示文字列
        labelIdle: 'ここに画像をドラッグ＆ドロップするか <span class="filepond--label-action">ブラウザから選択</span>',

        // 複数画像追加を許可
        allowMultiple: true,
        maxFiles: 10,

        // 画像を正方形にトリミング
        allowImageCrop: true,
        imageCropAspectRatio: '1:1',

        // 並び替えを許可
        allowReorder: true,
        itemInsertLocation: 'after',

        // 最初から読み込む画像の設定
        files: initialFiles,

        server: {
            // load（既存画像の読み込み完了通知）の通信を、ただURLをそのままパススルーさせる設定にする
            load: (source, load, error, progress, abort, headers) => {
                fetch(source)
                    .then(res => res.blob())
                    .then(load)
                    .catch(error);
            }
        },
    });


    // |ーーーーーーーーーーーーーーーーーーーーーーーーー
    // | イベント
    // |ーーーーーーーーーーーーーーーーーーーーーーーーー

    // ファイルの状態に変更があった時のイベント
    pond.on('updatefiles', (files) => {

        // ファイルが全部消えたらクリア
        if (files.length === 0) {
            updateMainPreview(null);
        } else {
            // 先頭を表示
            updateMainPreview(files[0]);
        }
    });

    // ファイルの並び替え確定時のイベント
    pond.on('reorderfiles', (files) => {

        // 並び順を入れるためのHTML要素を取得
        const orderInput = document.getElementById('imageOrderInput');
        
        // FilePondに入れられたファイルの配列を作る
        const currentOrder = files.map(file => file.file ? file.file.name : file.source);

        // カンマ区切りの文字列に変換
        if (orderInput) {
            orderInput.value = currentOrder.join(',');
        }
    });
    
    // FilePondで画像が削除ボタン押下時 (FilePondの×ボタンに紐づけてデータを送るため)
    pond.on('removefile', (error, file) => {
        
        // もし×ボタンで消されたのが「既存の画像（URL文字列）」だった場合
        if (typeof file.source === 'string' || file.source instanceof String) {
            
            // URLからfilenameを取得する
            const url = file.source;
            const parts = url.split('/');
            const folder = parts[parts.length - 2]; 
            const fileWithExt = parts[parts.length - 1]; 
            const filenameWithoutExt = fileWithExt.split('.')[0]; 
            const cloudinaryFilename = `${folder}/${filenameWithoutExt}`;

            // フォームの中に、削除用のチェックボックスを動的に作成
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'deleteImages[]';
            hiddenInput.value = cloudinaryFilename;
            
            form.appendChild(hiddenInput);
        }
    });

    // 下のサムネイルをクリック時にプレビュー画像を切り替える
    form.addEventListener('mousedown', (event) => {
      
        const fileItemElement = event.target.closest('.filepond--item');
        if (!fileItemElement) return;

        // 要素のIDを取得
        const fullId = fileItemElement.id;

        // 本体のIDを取り出す
        const itemId = fullId.replace('filepond--item-', '');

        // ターゲットのファイルを取得
        const targetFile = pond.getFile(itemId);

        // ファイルをプレビューに表示
        if (targetFile) {
            updateMainPreview(targetFile);
        }
    });

    
    // |ーーーーーーーーーーーーーーーーーーーーーーーーー
    // | 関数
    // |ーーーーーーーーーーーーーーーーーーーーーーーーー

    // 受け取ったファイルをプレビューに表示する
    function updateMainPreview(file) {

        // プレビューを表示する要素を取得
        const mainImage = document.getElementById('mainPreview');
        const placeholder = document.getElementById('mainPreviewPlaceholder');

        // ファイルの中身を確認
        if (!file) {
            mainImage.src = '';
            mainImage.classList.add('d-none');
            placeholder.classList.remove('d-none');
            return;
        }

        // 画像のURLを取得
        const imageUrl = file.file ? URL.createObjectURL(file.file) : file.source;

        // プレビューに表示
        mainImage.src = imageUrl;

        // 表示の切り替え
        mainImage.classList.remove('d-none');
        placeholder.classList.add('d-none');
    }
});