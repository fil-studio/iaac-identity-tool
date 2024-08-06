import { FloatingPanel } from "../core/FloatingPanel"

export class ColorPanel extends FloatingPanel {
    selectedColor:string;

    constructor(_dom:HTMLElement) {
        super(_dom);
    }

    show(hex:string) {
        this.selectedColor = hex;
        this.updateState();
        this.active = true;
    }

    hide() {
        this.active = false;
    }

    updateState() {
        // To-Do: en funció del selectedColor -> refrescar UI
    }
}