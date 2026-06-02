
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | filepondの設定・処理を追加するためのファイル
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
);

document.addEventListener('DOMContentLoaded', () => {

    // filepondのインプットを取得
    const inputElement = document.querySelector('.filepond');
    if (!inputElement) return;

    // 既存の画像URLを読み取る
    const existingFilesData = inputElement.dataset.files;
    let initialFiles = [];

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

    // プレビューに表示する画像の番号用の変数
    let currentSelectedIndex = 0; 

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

    // プレビュー画像を更新する
    function updateMainPreview(index) {

        const files = pond.getFiles();
        const mainImg = document.getElementById('mainPreview');
        const placeholder = document.getElementById('mainPreviewPlaceholder');

        // ファイルが空でなくインデックス指定がある場合
        if (files.length > 0 && files[index]) {

            // 現在のインデックスを更新
            currentSelectedIndex = index;

            // 画像のURLを取得し、プレビューのURLに追加する
            // const imageUrl = URL.createObjectURL(files[index].file);
            const imageUrl = files[index].file? URL.createObjectURL(files[index].file) : files[index].source;
            mainImg.src = imageUrl;

            // 画像を表示し、メッセージを非表示
            mainImg.classList.remove('d-none');
            placeholder.classList.add('d-none');

        // 指定したインデックスがない場合
        } else if (files.length > 0) {
        
            // 一枚目の画像をプレビューに表示
            updateMainPreview(0);

        // 画像が空っぽの場合
        } else {
            
            // プレビューのURLを空に、画像を非表示し、メッセージを表示
            mainImg.src = '';
            mainImg.classList.add('d-none');
            placeholder.classList.remove('d-none');
        }
    }

    // ファイルの状態に変更があった時に1枚目を表示
    pond.on('updatefiles', (files) => {

        // 削除や追加時、現在の選択位置が破綻しないようにチェックして更新
        if (currentSelectedIndex >= files.length) {
            currentSelectedIndex = Math.max(0, files.length - 1);
        }
        updateMainPreview(currentSelectedIndex);
    });

    // 下のサムネイルをクリック時にプレビュー画像を切り替える
    document.addEventListener('click', (e) => {
      
        const fileItemElement = e.target.closest('.filepond--item');
        if (!fileItemElement) return;

        const items = Array.from(document.querySelectorAll('.filepond--item'));
        const clickedIndex = items.indexOf(fileItemElement);

        if (clickedIndex !== -1) {
            updateMainPreview(clickedIndex);
        }
    });

    
    // FilePondの×ボタンに紐づけてデータを送るため
    // フォームの要素を取得
    const form = document.querySelector('form');

    // FilePondで画像が削除ボタン押下時
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
});