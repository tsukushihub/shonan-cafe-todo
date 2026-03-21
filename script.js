document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');

    // ゴミ箱アイコン（Google Material Symbols）
    const deleteIcon = '<span class="material-symbols-rounded">delete</span>';

    // 初期化（空の状態かどうかチェック）
    updateEmptyState();

    // タスク追加イベント（ボタンクリック）
    addButton.addEventListener('click', addTodo);

    // タスク追加イベント（Enterキー入力）
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // タスクを追加する関数
    function addTodo() {
        const text = todoInput.value.trim();
        
        // 入力が空の場合は何もしない
        if (text === '') return;

        // タスクの要素（li）を作成
        const li = document.createElement('li');
        li.className = 'todo-item';

        // 内側のHTML構造を作成
        li.innerHTML = `
            <div class="todo-content">
                <div class="check-circle"></div>
                <span class="todo-text">${escapeHTML(text)}</span>
            </div>
            <button class="delete-btn" aria-label="削除">
                ${deleteIcon}
            </button>
        `;

        // 完了/未完了の切り替えイベント
        const todoContent = li.querySelector('.todo-content');
        todoContent.addEventListener('click', () => {
            li.classList.toggle('completed');
        });

        // 削除イベント
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            // 親へのクリックイベント（完了切り替え）の伝播を防ぐ
            e.stopPropagation();
            
            // 少しアニメーションさせてから削除する
            li.style.transform = 'translateY(10px)';
            li.style.opacity = '0';
            setTimeout(() => {
                li.remove();
                updateEmptyState();
            }, 300);
        });

        // リストの先頭に追加
        todoList.prepend(li);
        
        // 入力欄をクリア
        todoInput.value = '';
        
        // 空の状態を非表示に
        updateEmptyState();
    }

    // タスクが0かどうかに応じて、Empty Stateの表示を切り替える関数
    function updateEmptyState() {
        if (todoList.children.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
        }
    }

    // XSS対策（テキストのエスケープ）
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
