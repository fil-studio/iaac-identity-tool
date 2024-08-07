import { HiddeableComponent } from "../core/Component";

export class ExportControls extends HiddeableComponent {
    protected isVideo:boolean = false;

    formatSel:HTMLElement;
    dimsSel:HTMLElement;
    exportBtn:HTMLButtonElement;

    constructor(_dom:HTMLElement) {
        super(_dom);

        const buttons = _dom.querySelectorAll('.button');
        this.formatSel = buttons[0] as HTMLElement;
        this.dimsSel = buttons[1] as HTMLElement;
        this.exportBtn = buttons[2] as HTMLButtonElement;

        this.refresh();
    }

    set video(value:boolean) {
        this.isVideo = value;
        this.refresh();
    }

    refresh() {
        if(this.isVideo) {
            this.formatSel.classList.remove('disabled');
        } else {
            this.formatSel.classList.add('disabled');
        }
    }
}