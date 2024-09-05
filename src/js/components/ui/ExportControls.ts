import { Visual } from "../../gfx/Visual";
import { HiddeableComponent } from "../core/Component";
import { ExportUI } from "./menu/ExportUI";

export class ExportControls extends HiddeableComponent {
    protected isVideo:boolean = false;

    formatSel:HTMLElement;
    dimsSel:HTMLElement;
    exportBtn:HTMLButtonElement;

    exportUI:ExportUI;

    constructor(_dom:HTMLElement) {
        super(_dom);

        const buttons = _dom.querySelectorAll('.button');
        this.formatSel = buttons[0] as HTMLElement;
        this.exportBtn = buttons[1] as HTMLButtonElement;

        this.exportUI = new ExportUI(document.querySelector('section.modal'));

        const sel = _dom.querySelector('select');
        // console.log(sel.value);

        this.exportBtn.onclick = () => {
            const video = this.isVideo && (sel.value === "Video");
            this.exportUI.show(video);
        }

        this.refresh();
    }

    set video(value:boolean) {
        this.isVideo = value;
        this.refresh();
    }

    refresh() {
        super.refresh();
        if(this.isVideo) {
            this.formatSel.classList.remove('disabled');
        } else {
            this.formatSel.classList.add('disabled');
        }
    }
}