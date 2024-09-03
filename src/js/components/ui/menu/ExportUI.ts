import { HiddeableComponent } from "../../core/Component";

export class ExportUI extends HiddeableComponent {
    constructor(_dom:HTMLElement) {
        super(_dom);

        const cancel = () => {
            if(this._active) this.hide();
        }

        const save = () => {
            if(this._active) this.hide();
        }

        const btns = _dom.querySelectorAll('button');

        const cancelBtn = btns[0];
        const exportBtn = btns[1];

        cancelBtn.onclick = cancel;
        exportBtn.onclick = save;
    }

    show(isVideo:boolean=false) {
        this.active = true;
    }

    hide() {
        this.active = false;
    }
}