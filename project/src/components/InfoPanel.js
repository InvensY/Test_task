/**
 * InfoPanel - информационная панель
 */

export class InfoPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.polygonCount = 0;
        this.selectedPolygon = null;
    }
    
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        
        // Сохраняем ссылки на элементы
        this.countElement = this.shadowRoot.getElementById('polygonCount');
        this.selectedInfoContainer = this.shadowRoot.getElementById('selectedInfo');
        
        this.updateInfo();
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .info-panel {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border-radius: 16px;
                    padding: 20px;
                    color: #f1f5f9;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .stat {
                    background: #334155;
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                }
                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #3b82f6;
                }
                .selected-section {
                    background: #334155;
                    border-radius: 12px;
                    padding: 12px 16px;
                }
                .section-title {
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    padding: 6px 0;
                    border-bottom: 1px solid #475569;
                }
                .info-label {
                    opacity: 0.7;
                }
                .info-value {
                    font-weight: 500;
                    color: #facc15;
                }
                .no-selection {
                    text-align: center;
                    padding: 20px;
                    opacity: 0.5;
                }
                .preview-canvas {
                    width: 100%;
                    height: 100px;
                    background: #1e293b;
                    border-radius: 8px;
                    margin-top: 10px;
                    border: 1px solid #475569;
                }
            </style>
            
            <div class="info-panel">
                <div class="stat">
                    <span>📐 Всего полигонов</span>
                    <span class="stat-value" id="polygonCount">0</span>
                </div>
                <div class="selected-section">
                    <div class="section-title">🎯 Выбранный полигон</div>
                    <div id="selectedInfo">
                        <div class="no-selection">⚡ Ничего не выбрано</div>
                    </div>
                </div>
            </div>
        `;
    }

    
    setupEventListeners() {
        document.addEventListener('polygons-updated', () => this.updateInfo());
        document.addEventListener('polygon-selected', () => this.updateInfo());
    }
    
    getCanvasView() {
        const appEditor = document.querySelector('app-editor');
        return appEditor?.shadowRoot?.querySelector('canvas-view');
    }
    
    updateInfo() {
        const canvas = this.getCanvasView();
        if (!canvas) return;
        
        // Обновляем счетчик
        const count = canvas.polygons?.length || 0;
        if (this.countElement) {
            this.countElement.textContent = count;
        }
        
        // Получаем выбранный полигон
        const newSelected = canvas.selectedPolygon || null;
        
        // Обновляем только если выбранный полигон изменился
        const oldId = this.selectedPolygon?.id || null;
        const newId = newSelected?.id || null;
        
        if (oldId !== newId) {
            this.selectedPolygon = newSelected;
            this.updateSelectedInfo();
        }
    }
    
    updateSelectedInfo() {
        if (!this.selectedInfoContainer) return;
        
        if (!this.selectedPolygon) {
            this.selectedInfoContainer.innerHTML = '<div class="no-selection">⚡ Ничего не выбрано</div>';
            return;
        }
        
        const p = this.selectedPolygon;
        const vertices = p.points;
        const vertexCount = vertices.length;
        
        // Центр
        let cx = 0, cy = 0;
        for (const v of vertices) {
            cx += v.x;
            cy += v.y;
        }
        cx = Math.round(cx / vertexCount);
        cy = Math.round(cy / vertexCount);
        
        // Размеры
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        for (const v of vertices) {
            minX = Math.min(minX, v.x);
            maxX = Math.max(maxX, v.x);
            minY = Math.min(minY, v.y);
            maxY = Math.max(maxY, v.y);
        }
        const width = Math.round(maxX - minX);
        const height = Math.round(maxY - minY);
        
        this.selectedInfoContainer.innerHTML = `
            <div class="info-row">
                <span class="info-label">🎨 Цвет</span>
                <span class="info-value">${p.color}</span>
            </div>
            <div class="info-row">
                <span class="info-label">🔷 Вершины</span>
                <span class="info-value">${vertexCount}</span>
            </div>
            <div class="info-row">
                <span class="info-label">📏 Размер</span>
                <span class="info-value">${width} × ${height} px</span>
            </div>
            <div class="info-row">
                <span class="info-label">📍 Центр</span>
                <span class="info-value">(${cx}, ${cy})</span>
            </div>
            <canvas id="previewCanvas" class="preview-canvas"></canvas>
        `;
        requestAnimationFrame(() => {
            this.drawPreview(vertices, p.color);
        });
    }
        drawPreview(vertices, color) {
        const previewCanvas = this.shadowRoot.getElementById('previewCanvas');
        if (!previewCanvas) return;
        
        const rect = previewCanvas.parentElement.getBoundingClientRect();
        previewCanvas.width = rect.width - 32 || 200;
        previewCanvas.height = 100;
        
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        if (!vertices || vertices.length < 3) return;
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const v of vertices) {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        }
        
        const polyWidth = maxX - minX;
        const polyHeight = maxY - minY;
        const scale = Math.min(
            (previewCanvas.width - 20) / polyWidth,
            (previewCanvas.height - 20) / polyHeight
        );
        
        const offsetX = (previewCanvas.width - polyWidth * scale) / 2;
        const offsetY = (previewCanvas.height - polyHeight * scale) / 2;
        
        ctx.beginPath();
        const firstX = offsetX + (vertices[0].x - minX) * scale;
        const firstY = offsetY + (vertices[0].y - minY) * scale;
        ctx.moveTo(firstX, firstY);
        
        for (let i = 1; i < vertices.length; i++) {
            const x = offsetX + (vertices[i].x - minX) * scale;
            const y = offsetY + (vertices[i].y - minY) * scale;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

customElements.define('info-panel', InfoPanel);