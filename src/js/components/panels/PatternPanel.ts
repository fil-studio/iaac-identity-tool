import { addFileDropHandler } from "@fils/utils";
import { FloatingPanel } from "../core/FloatingPanel";
import { supportedImage } from "../../core/FileTypes";

export class PatternPanel extends FloatingPanel {
    selectedImage:string;
    library:HTMLInputElement[] = [];

    constructor(_id:string, _dom:HTMLElement) {
        super(_id, _dom);

        const body = _dom.querySelector('.panel-body') as HTMLElement;

        // Utility function to prevent default browser behavior
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Preventing default browser behavior when dragging a file over the container
        body.addEventListener('dragover', preventDefaults);
        body.addEventListener('dragenter', preventDefaults);
        body.addEventListener('dragleave', preventDefaults);
        
        addFileDropHandler(body, (files) => {
            const file = files[0];
            if(supportedImage.indexOf(file.type) > -1) {
                this.setFile(file);
            }
            body.classList.remove('drop');
        }, () => {
            body.classList.add('drop');
        }, () => {
            body.classList.remove('drop');
        });

        const inputs = _dom.querySelectorAll('input');
        for(const input of inputs) {
            if(input.type === 'file') {
                input.addEventListener('change', e => {
                    this.setFile(input.files[0]);
                })
                continue;
            };
            this.library.push(input);

            input.onclick = () => {
                this.setValue(input.value);
            }
        }
    }

    protected setFile(file:File) {
        this.selectedImage = 'custom';
        for(const lis of this.listeners) {
            lis.onPanelDataChanged(this.id, {
                value: 'custom',
                isFile: true,
                file: file
            });
        }
        this.updateState();
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
        // console.log(this.selectedImage);
        for(const input of this.library) input.checked = false;
        if(this.selectedImage === 'custom') return;
        this.library[parseInt(this.selectedImage)-1].checked = true;
    }
}