import { FloatingPanel } from "../core/FloatingPanel";

export class PatternPanel extends FloatingPanel {
    selectedImage:string;
    library:HTMLInputElement[] = [];

    constructor(_id:string, _dom:HTMLElement) {
        super(_id, _dom);

        const inputs = _dom.querySelectorAll('input');
        for(const input of inputs) {
            if(input.type === 'file') {
                input.addEventListener('change', e => {
                    this.selectedImage = 'custom';
                    for(const lis of this.listeners) {
                        lis.onPanelDataChanged(this.id, {
                            value: 'custom',
                            isFile: true,
                            file: input.files[0]
                        });
                    }
                    this.updateState();
                })
                continue;
            };
            this.library.push(input);

            input.onclick = () => {
                this.setValue(input.value);
            }
        }
    }

    protected setValue(value:string) {
        // console.log(value);
        this.selectedImage = value;
        // console.log(`Value changed to ${this.selectedImage}`);
        for(const lis of this.listeners) {
            lis.onPanelDataChanged(this.id, {
                value,
                isFile: false
            });
        }
    }

    show(id:string) {
        // this.selectedColor = hex;
        this.selectedImage = id;
        this.updateState();
        this.active = true;
    }

    hide() {
        this.active = false;
    }

    updateState() {
        // To-Do: en funció del selectedColor -> refrescar UI
        console.log(this.selectedImage);
        for(const input of this.library) input.checked = false;
        if(this.selectedImage === 'custom') return;
        this.library[parseInt(this.selectedImage)-1].checked = true;
    }
}