import './CanvasView.js'
import './InfoPanel.js'
import './ToolPanel.js'


export class AppEditor extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({mode: 'open'})
    }

    connectedCallback(){
        this.shadowRoot.innerHTML = `
        <style>
            .container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                padding: 20px;
            }
            .main {
                display: flex;
                flex: 1;
                gap: 20px;
            }
            canvas-view {
                flex: 1;
                background: #f0f0f0;
                border-radius: 12px;
            }
            .sidebar {
                width: 280px;
            }       
        </style>
        <div class="container">
            <tool-panel></tool-panel>
            <div class="main">
                <canvas-view></canvas-view>
                <div class="sidebar">
                    <info-panel></info-panel>
                </div>
            </div>
        </div>
    `;
  }
}

customElements.define('app-editor', AppEditor);
