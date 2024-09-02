import { hexToRgb } from "@fils/color";
import { FloatingPanel } from "../core/FloatingPanel"

export class ColorPanel extends FloatingPanel {
    selectedColor:string;
    library:HTMLInputElement[] = [];

    constructor(_id:string, _dom:HTMLElement) {
        super(_id, _dom);

        const setInputColor = (input) => {
            const parent = input.parentElement as HTMLElement;
            const rgb = hexToRgb(input.value);
            parent.style.setProperty('--bg-color', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .15)`);
            this.setValue(input.value.replace("#", ''));
            this.updateState();
        }

        const inputs = _dom.querySelectorAll('input');
        for(const input of inputs) {
            if(input.type === 'color') {
                input.oninput = () =>{
                    setInputColor(input);
                }
                input.onclick = () => {
                    setInputColor(input);
                }
                continue;
            }
            this.library.push(input);
            const rgb = hexToRgb(`#${input.value}`);
            // console.log(rgb);
            const parent = input.parentElement as HTMLElement;
            parent.style.setProperty('--selected-r', `${rgb.r}`);
            parent.style.setProperty('--selected-g', `${rgb.g}`);
            parent.style.setProperty('--selected-b', `${rgb.b}`);

            input.onclick = () => {
                this.setValue(input.value);
            }
        }
    }

    protected setValue(value:string) {
        this.selectedColor = value;
        // console.log(`Value changed to ${this.selectedColor}`);
        for(const lis of this.listeners) {
            lis.onPanelDataChanged(this.id, this.selectedColor);
        }
    }

    get hexColor():string {
        return `#${this.selectedColor}`;
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
        for(const input of this.library) {
            input.checked = input.value === this.selectedColor;
            if(input.checked) {
                // To-Do: custom color not used
            }
        }
    }
}