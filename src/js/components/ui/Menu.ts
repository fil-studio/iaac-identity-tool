import { Component } from "../core/Component";
import { MenuLayer } from "./menu/MenuLayer";

export class Menu extends Component {
    protected isCropping:boolean = false;

    layer1:MenuLayer;
    layer2:MenuLayer;

    constructor(_dom:HTMLElement) {
        super(_dom);

        const layers = _dom.querySelectorAll('.layer');
        this.layer1 = new MenuLayer(layers[0] as HTMLElement);
        this.layer2 = new MenuLayer(layers[1] as HTMLElement);
    }

    set cropping(value:boolean) {
        this.isCropping = value;
        this.refresh();
    }

    refresh(): void {
        console.log(this.isCropping)
        this.layer1.active = !this.isCropping;
        this.layer2.active = !this.layer1.active;
    }

}