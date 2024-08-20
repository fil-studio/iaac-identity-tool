import { HiddeableComponent } from "../components/core/Component";
import { FloatingPanel } from "../components/core/FloatingPanel";
import { ColorPanel } from "../components/panels/ColorPanel";
import { ExportControls } from "../components/ui/ExportControls";
import { Menu } from "../components/ui/Menu";
import { TopBar, TopBarListener } from "../components/ui/TopBar";

export class Controller implements TopBarListener {
    loader:HiddeableComponent;

    colorsPanel:ColorPanel;
    symbolsPanel:FloatingPanel;

    topBar:TopBar;
    exportCtrl:ExportControls;

    menu:Menu;

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

        this.topBar = new TopBar(document.querySelector('#topbar'));
        this.exportCtrl = new ExportControls(document.querySelector('#export'));

        this.menu = new Menu(document.querySelector('aside'));
        // this.menu.cropping = true;

        // this.colorsPanel.show("DB7347");

        this.symbolsPanel.active = true;

        // this.loader.active = true;


        this.addListeners();
    }

    addListeners() {
        this.topBar.addListener(this);

        window.addEventListener('keydown', e => {
            if(e.key === 'Escape') {
                this.topBar.cropping = false;
            }
        })
    }

    onCropChanged(value: boolean) {
        console.log('Crop changed', value)
        this.menu.cropping = value;
    }
}