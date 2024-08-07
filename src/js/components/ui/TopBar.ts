import { Component } from "../core/Component";

export interface TopBarListener {
    onCropChanged(value:boolean);
}

export class TopBar extends Component {
    protected isCropping:boolean = false;

    cropButton:HTMLButtonElement;
    zoomSel:HTMLElement;

    listeners:TopBarListener[] = [];

    constructor(_dom:HTMLElement) {
        super(_dom);

        const buttons = _dom.querySelectorAll('.button');
        this.cropButton = buttons[0] as HTMLButtonElement;
        this.zoomSel = buttons[1] as HTMLElement;
        
        this.cropButton.onclick = () => {
            this.cropping = true;
        }
    }

    set cropping(value:boolean) {
        this.isCropping = value;
        this.refresh();
        for(const lis of this.listeners) {
            lis.onCropChanged(value);
        }
    }

    addListener(lis:TopBarListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:TopBarListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    refresh() {
        if(this.isCropping) {
            this.zoomSel.classList.add('disabled');
            this.cropButton.classList.add('super-disabled');
        } else {
            this.zoomSel.classList.remove('disabled');
            this.cropButton.classList.remove('super-disabled');
        }
    }
}