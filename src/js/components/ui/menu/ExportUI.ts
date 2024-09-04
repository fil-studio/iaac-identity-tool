import { saveBlob } from "../../../core/EsportUtils";
import { SCOPE } from "../../../core/Globals";
import { Visual } from "../../../gfx/Visual";
import { HiddeableComponent } from "../../core/Component";

const MAX = 4096 * 4096;

export class ExportUI extends HiddeableComponent {
    constructor(_dom:HTMLElement) {
        super(_dom);

        const cancel = () => {
            if(this._active) this.hide();
        }

        const saveImage = () => {
            const canvas = SCOPE.view.gl.domElement;
            canvas.toBlob(blob => {
                const filename = `download-${Date.now()}.png`;
                saveBlob(blob, filename);
                this.restoreCanvas();
                this.hide();
            }, "png");
        }

        const save = () => {
            // if(this._active) this.hide();
            const canvas = SCOPE.view.gl.domElement;
            if(Visual.video) {
                console.warn('Video not supported yet!');
            } else {
                this.configCanvasForExport();
                SCOPE.view.render();
                if(canvas.width * canvas.height > MAX) {
                    if(window.confirm('Max canvas size exceeded. File might not export correctly. Try anyway?')) {
                        saveImage();
                    }
                } else {
                    saveImage();
                }
            }
        }

        const btns = _dom.querySelectorAll('button');

        const cancelBtn = btns[0];
        const exportBtn = btns[1];

        cancelBtn.onclick = cancel;
        exportBtn.onclick = save;
    }

    protected configCanvasForExport() {
        const el = this.dom.querySelector('select#exportSize') as HTMLSelectElement;
        const scale = parseFloat(el.value);
        const w = Math.round(Visual.crop.width * scale);
        const h = Math.round(Visual.crop.height * scale);

        console.log('setting export scale to', scale);

        SCOPE.view.setSize(w, h);
        SCOPE.engine.updateResolution(w, h);
    }

    protected restoreCanvas() {
        const el = this.dom.querySelector('select#exportSize') as HTMLSelectElement;
        const w = Visual.crop.width;
        const h = Visual.crop.height;

        SCOPE.view.setSize(w, h);
        SCOPE.engine.updateResolution(w, h);

        SCOPE.view.render();
    }

    show(isVideo:boolean=false) {
        this.active = true;
        const a = this.dom.querySelector('div.alert');
        a.textContent = `Canvas size: ${Visual.crop.width}x${Visual.crop.height}`
        SCOPE.exporting = true;
    }

    hide() {
        this.active = false;
        SCOPE.exporting = false;
    }
}