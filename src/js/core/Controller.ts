import { HiddeableComponent } from "../components/core/Component";
import { FloatingPanel } from "../components/core/FloatingPanel";
import { ColorPanel } from "../components/panels/ColorPanel";

export class Controller {
    loader:HiddeableComponent;

    colorsPanel:ColorPanel;
    symbolsPanel:FloatingPanel;

    constructor() {
        this.loader = new HiddeableComponent(
            document.querySelector('.loading')
        );

        const panels = document.querySelectorAll('.panel');

        this.colorsPanel = new ColorPanel(
            panels[0] as HTMLElement
        );

        this.symbolsPanel = new FloatingPanel(
            panels[1] as HTMLElement
        );

        this.colorsPanel.show("#FFD302");

        // this.symbolsPanel.active = true;

        // this.loader.active = true;
    }
}