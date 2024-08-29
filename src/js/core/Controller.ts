import { HiddeableComponent } from "../components/core/Component";
import { FloatingPanel, FloatingPanelListener } from "../components/core/FloatingPanel";
import { ColorPanel } from "../components/panels/ColorPanel";
import { ExportControls } from "../components/ui/ExportControls";
import { Menu } from "../components/ui/Menu";
import { Card, CardListener } from "../components/ui/menu/CardContainer";
import { TopBar, TopBarListener } from "../components/ui/TopBar";

export interface SettingsChangedListener {
    onColorsChanged(values:string[]);
}

export class Controller implements TopBarListener, CardListener, FloatingPanelListener {
    loader:HiddeableComponent;

    colorsPanel:ColorPanel;
    symbolsPanel:FloatingPanel;

    topBar:TopBar;
    exportCtrl:ExportControls;

    menu:Menu;

    selectedColorCard:Card = null;

    listeners:SettingsChangedListener[] = [];

    constructor() {
        this.loader = new HiddeableComponent(
            document.querySelector('.loading')
        );

        const panels = document.querySelectorAll('.panel');

        this.colorsPanel = new ColorPanel( "colors",
            panels[0] as HTMLElement
        );

        this.symbolsPanel = new FloatingPanel( "patterns",
            panels[1] as HTMLElement
        );

        this.topBar = new TopBar(document.querySelector('#topbar'));
        this.exportCtrl = new ExportControls(document.querySelector('#export'));

        this.menu = new Menu(document.querySelector('aside'));
        // this.menu.cropping = true;

        // this.colorsPanel.show("DB7347");

        // this.symbolsPanel.active = true;

        // this.loader.active = true;


        this.addListeners();
    }

    addListener(lis:SettingsChangedListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:SettingsChangedListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    addListeners() {
        this.topBar.addListener(this);
        this.menu.colors.addCardListener(this);
        this.colorsPanel.addListener(this);

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

    onCardSelected(id: string, card: Card) {
        if(id === 'color') {
            const tile = card.dom.querySelector('.tile') as HTMLElement;
            const colId = tile.getAttribute('card-value');
            console.log(colId);
            this.selectedColorCard = card;
            this.colorsPanel.show(colId);
        }
    }

    onCardSwap(id: string) {
        if(id === 'color') {
            this.fireColorsChanged();
        }
    }

    onPanelDataChanged(id:string, data:any) {
        if(id === 'colors') {
            if(!this.selectedColorCard) return;
            const tile = this.selectedColorCard.dom.querySelector('.tile') as HTMLElement;
            tile.setAttribute('card-value', data);
            tile.style.backgroundColor = `#${data}`;
            this.fireColorsChanged();
        }
    }

    onPanelClosed(id: string) {
        if(id === 'colors') {
            this.selectedColorCard = null;
        }
    }

    protected fireColorsChanged() {
        const colors = ["", "", "", ""];
        const cards = this.menu.colors.cards;
        for(const card of cards) {
            const val = card.dom.querySelector('.tile').getAttribute('card-value');
            colors[card.position] = `#${val}`;
        }

        for(const lis of this.listeners) {
            lis.onColorsChanged(colors);
        }
    }
}