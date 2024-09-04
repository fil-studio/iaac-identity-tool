import { addFileDropHandler, el } from "@fils/utils";
import { FloatingPanel } from "../core/FloatingPanel";
import { supportedImage } from "../../core/FileTypes";

export class PatternPanel extends FloatingPanel {
    selectedImage:string;
    library:HTMLInputElement[] = [];

    nCustom:number = 0;

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
            for(const file of files) {
                if(supportedImage.indexOf(file.type) > -1) {
                    this.setFile(file);
                }
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
        const url = URL.createObjectURL(file);
        this.selectedImage = url;
        /* for(const lis of this.listeners) {
            lis.onPanelDataChanged(this.id, {
                value: 'custom',
                isFile: true,
                file: file
            });
        } */

        console.log(this.selectedImage);

        const ul = this.dom.querySelector('ul');
        const v = 11+this.nCustom;
        const id = `pattern_${v}`;

        this.nCustom++;

        const li = el('li', 'pattern_preset-item');
        const label = el('label', 'pattern_preset-label', li);
        label.setAttribute('for', id);

        const input = el('input', '', label) as HTMLInputElement;
        input.type = "radio";
        input.value = url;
        input.id = id;

        input.onclick = () => {
            this.setValue(input.value);
        }

        const span1 = el('span', 'label', label);
        const span2 = el('span', 'tile', span1);
        const img = new Image();
        img.className = "pattern";
        img.style.pointerEvents = 'none';
        // img.style.width = `44px`;
        // img.style.height = `44px`;
        img.src = url;
        span2.appendChild(img);
        this.library.push(input)

        ul.appendChild(li);

        this.updateState();

        for(const lis of this.listeners) {
            lis.onPanelDataChanged(this.id, {
                value: url,
                isFile: false
            });
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

        this.updateState();
    }

    show(id:string, el:HTMLElement=null) {
        // this.selectedColor = hex;
        if(el) {
            this.setPositionToElement(el);
        }

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
        for(const input of this.library) {
            // console.log(this.selectedImage, input.value);
            input.checked = input.value === this.selectedImage;
        }
    }
}