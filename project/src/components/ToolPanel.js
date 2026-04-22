/**
 * ToolPanel - панель управления
 * Отвечает за кнопки и горячие клавиши
 */

export class ToolPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isUndoing = false; 
        
        // Привязываем обработчики событий
        this.handleUndo = this.handleUndo.bind(this);
        this.handleRedo = this.handleRedo.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    connectedCallback() {
        this.render();
        this.initEventListeners();
        this.setupKeyboardShortcuts();
    }
    
    disconnectedCallback() {
        // Убираем глобальные слушатели при удалении компонента
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Очищаем обработчики кнопок
        const generateBtn = this.shadowRoot?.getElementById('generateBtn');
        if (generateBtn) generateBtn.removeEventListener('click', this.handleGenerate);
        
        const deleteBtn = this.shadowRoot?.getElementById('deleteBtn');
        if (deleteBtn) deleteBtn.removeEventListener('click', this.handleDelete);
        
        const deleteAllBtn = this.shadowRoot?.getElementById('deleteAllBtn');
        if (deleteAllBtn) deleteAllBtn.removeEventListener('click', this.handleDeleteAll);
        
        const undoBtn = this.shadowRoot?.getElementById('undoBtn');
        if (undoBtn) undoBtn.removeEventListener('click', this.handleUndo);
        
        const redoBtn = this.shadowRoot?.getElementById('redoBtn');
        if (redoBtn) redoBtn.removeEventListener('click', this.handleRedo);
    }
    
    getCanvasView() {
        const appEditor = document.querySelector('app-editor');
        return appEditor?.shadowRoot?.querySelector('canvas-view');
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    margin-bottom: 20px;
                }
                
                button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 500;
                    font-family: inherit;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: #334155;
                    color: #f1f5f9;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                button:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }
                
                button:active {
                    transform: translateY(0);
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }
                
                .btn-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }
                
                .btn-warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }
                
                .btn-secondary {
                    background: linear-gradient(135deg, #64748b, #475569);
                }
                
                .separator {
                    width: 1px;
                    height: 40px;
                    background: #475569;
                    margin: 0 8px;
                }
                
                .shortcut {
                    font-size: 11px;
                    opacity: 0.7;
                    background: rgba(0,0,0,0.3);
                    padding: 2px 6px;
                    border-radius: 6px;
                }
                
                @media (max-width: 700px) {
                    .toolbar { gap: 8px; padding: 12px; }
                    button { padding: 8px 14px; font-size: 12px; }
                    .shortcut { display: none; }
                }
            </style>
            
            <div class="toolbar">
                <button id="generateBtn" class="btn-primary">
                    ✨ Сгенерировать
                    <span class="shortcut">Ctrl+G</span>
                </button>
                
                <button id="deleteBtn" class="btn-danger">
                    🗑️ Удалить выбранный
                    <span class="shortcut">Delete</span>
                </button>
                
                <button id="deleteAllBtn" class="btn-warning">
                    ⚠️ Удалить все
                </button>
                
                <div class="separator"></div>
                
                <button id="undoBtn" class="btn-secondary">
                    ↩️ Отменить
                    <span class="shortcut">Ctrl+Z</span>
                </button>
                
                <button id="redoBtn" class="btn-secondary">
                    ↪️ Повторить
                    <span class="shortcut">Ctrl+Y</span>
                </button>
                <button id="exportBtn" class="btn-secondary">
                    💾 Экспорт
                </button>
                <button id="importBtn" class="btn-secondary">
                    📁 Импорт
                </button>
                <input type="file" id="importFile" style="display: none;" accept=".json">
            </div>
        `;
    }
    
    initEventListeners() {
        console.log('initEventListeners вызван');
        
        // Кнопка "Сгенерировать"
        const generateBtn = this.shadowRoot.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.removeEventListener('click', this.handleGenerate);
            this.handleGenerate = () => {
                const canvas = this.getCanvasView();
                if (canvas && typeof canvas.generatePolygon === 'function') {
                    canvas.generatePolygon();
                }
            };
            generateBtn.addEventListener('click', this.handleGenerate);
        }
        
        // Кнопка "Удалить выбранный"
        const deleteBtn = this.shadowRoot.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.removeEventListener('click', this.handleDelete);
            this.handleDelete = () => {
                const canvas = this.getCanvasView();
                if (canvas && typeof canvas.deleteSelected === 'function') {
                    const success = canvas.deleteSelected();
                    if (!success) {
                        this.showToast('❌ Полигон не выбран');
                    }
                }
            };
            deleteBtn.addEventListener('click', this.handleDelete);
        }
        // Кнопка "Экспорт"
        const exportBtn = this.shadowRoot.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const canvas = this.getCanvasView();
                if (canvas && canvas.exportScene) {
                    canvas.exportScene();
                }
            });
        }

        // Кнопка "Импорт"
        const importBtn = this.shadowRoot.getElementById('importBtn');
        const importFile = this.shadowRoot.getElementById('importFile');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });
            
            importFile.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const canvas = this.getCanvasView();
                    if (canvas && canvas.importScene) {
                        canvas.importScene(file);
                    }
                }
                importFile.value = ''; // очищаем input
            });
        }
        
        // Кнопка "Удалить все"
        const deleteAllBtn = this.shadowRoot.getElementById('deleteAllBtn');
        if (deleteAllBtn) {
            deleteAllBtn.removeEventListener('click', this.handleDeleteAll);
            this.handleDeleteAll = () => {
                const canvas = this.getCanvasView();
                if (canvas && typeof canvas.deleteAll === 'function') {
                    if (canvas.getPolygonCount() === 0) {
                        this.showToast('⚠️ Нет полигонов для удаления');
                    } else {
                        canvas.deleteAll();
                        this.showToast('🗑️ Все полигоны удалены');
                    }
                }
            };
            deleteAllBtn.addEventListener('click', this.handleDeleteAll);
        }
        
        // Кнопка "Отменить" (Undo)
        const undoBtn = this.shadowRoot.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.removeEventListener('click', this.handleUndo);
            undoBtn.addEventListener('click', this.handleUndo);
        }
        
        // Кнопка "Повторить" (Redo)
        const redoBtn = this.shadowRoot.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.removeEventListener('click', this.handleRedo);
            redoBtn.addEventListener('click', this.handleRedo);
        }
    }
    
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    handleKeyDown(event) {
        const isCtrl = event.ctrlKey || event.metaKey;
        
        // Ctrl+Z → Undo
        if (isCtrl && event.key === 'z') {
            event.preventDefault();
             console.log('Ctrl+Z нажата');
            this.handleUndo();
        }
        
        // Ctrl+Y → Redo
        if (isCtrl && event.key === 'y') {
            event.preventDefault();
            this.handleRedo();
        }
        
        // Ctrl+Shift+Z → Redo
        if (isCtrl && event.shiftKey && event.key === 'Z') {
            event.preventDefault();
            this.handleRedo();
        }
        
        // Delete → удалить выбранный полигон
        if (event.key === 'Delete') {
            event.preventDefault();
            const canvas = this.getCanvasView();
            if (canvas) {
                const success = canvas.deleteSelected();
                if (!success) {
                    this.showToast('❌ Полигон не выбран');
                }
            }
        }
        
        // Ctrl+G → сгенерировать полигон
        if (isCtrl && event.key === 'g') {
            event.preventDefault();
            const canvas = this.getCanvasView();
            if (canvas && canvas.generatePolygon) {
                canvas.generatePolygon();
            }
        }
    }
    
    handleUndo() {
        console.log('handleUndo вызван');
        const canvas = this.getCanvasView();
        if (canvas && typeof canvas.undo === 'function') {
            canvas.undo();
        } else {
            console.log('canvas.undo не найден или не функция');
            this.showToast('⚠️ Undo не доступен');
        }
    }

    handleRedo() {
        console.log('handleRedo вызван');
        const canvas = this.getCanvasView();
        if (canvas && typeof canvas.redo === 'function') {
            canvas.redo();
        } else {
            console.log('canvas.redo не найден или не функция');
            this.showToast('⚠️ Redo не доступен');
        }
    }
    
    showToast(message) {
        // Создаем временное всплывающее сообщение
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Регистрируем компонент
customElements.define('tool-panel', ToolPanel);