document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');

    // ゴミ箱アイコン（Google Material Symbols）
    const deleteIcon = '<span class="material-symbols-rounded">delete</span>';

    // 初期化（ストレージから読み込み、空状態のチェック）
    loadTodos().then(() => {
        updateEmptyState();
    });

    // タスク追加イベント（ボタンクリック）
    addButton.addEventListener('click', addTodo);

    // タスク追加イベント（Enterキー入力）
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // タスクを追加する関数（新規入力時）
    function addTodo() {
        const text = todoInput.value.trim();
        
        // 入力が空の場合は何もしない
        if (text === '') return;

        // DOM要素の作成と追加
        const li = createTodoElement(text, false);
        todoList.prepend(li); // 新しいものは上に
        
        // 入力欄をクリア
        todoInput.value = '';
        
        // ローカルストレージに保存
        saveTodos();
        
        // 空の状態を更新
        updateEmptyState();
    }

    // タスクのDOM要素を作成する関数
    function createTodoElement(text, completed) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (completed) {
            li.classList.add('completed');
        }

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
            saveTodos(); // 状態が変わったので保存
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
                saveTodos(); // 要素が消えたので保存
                updateEmptyState();
            }, 300);
        });

        return li;
    }

    // タスクが0かどうかに応じて、Empty Stateの表示を切り替える関数
    function updateEmptyState() {
        if (todoList.children.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
        }
    }

    // ローカルストレージにタスクを保存する関数
    function saveTodos() {
        const todos = [];
        const todoItems = todoList.querySelectorAll('.todo-item');
        todoItems.forEach(item => {
            const textElement = item.querySelector('.todo-text');
            const text = textElement.textContent.trim();
            const completed = item.classList.contains('completed');
            todos.push({ text, completed });
        });
        
        // localStorageとlocalForage両方に保存（iOSでのデータ消失対策）
        localStorage.setItem('shonan_todos', JSON.stringify(todos));
        if (typeof localforage !== 'undefined') {
            localforage.setItem('shonan_todos', todos).catch(e => console.error("データ保存エラー:", e));
        }
    }

    // ストレージからタスクを読み込む関数
    async function loadTodos() {
        try {
            let todos = null;
            
            // 1. より安全なlocalForage(IndexedDB)から読み込みを試みる
            if (typeof localforage !== 'undefined') {
                todos = await localforage.getItem('shonan_todos');
            }
            
            // 2. localForageにデータがない場合、古いlocalStorageの内容を引き継ぐ
            if (!todos) {
                const savedTodos = localStorage.getItem('shonan_todos');
                if (savedTodos) {
                    todos = JSON.parse(savedTodos);
                    // 移行したデータをlocalForageにも保存しておく
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem('shonan_todos', todos);
                    }
                }
            }

            // 3. データを画面に表示する
            if (todos && Array.isArray(todos)) {
                todos.forEach(todo => {
                    const li = createTodoElement(todo.text, todo.completed);
                    todoList.appendChild(li); 
                });
            }
        } catch (e) {
            console.error("タスクの読み込みに失敗しました:", e);
        }
    }

    // XSS対策（テキストのエスケープ）
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
