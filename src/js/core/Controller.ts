import { Texture } from "three";
import { HiddeableComponent } from "../components/core/Component";
import { FloatingPanelListener } from "../components/core/FloatingPanel";
import { ColorPanel } from "../components/panels/ColorPanel";
import { PatternPanel } from "../components/panels/PatternPanel";
import { ExportControls } from "../components/ui/ExportControls";
import { Menu } from "../components/ui/Menu";
import { Card, CardListener } from "../components/ui/menu/CardContainer";
import { Knot, ThresholdController, ThresholdListener } from "../components/ui/ThresholdController";
import { TilesController, TilesControllerListener } from "../components/ui/TilesController";
import { TopBar, TopBarListener } from "../components/ui/TopBar";
import { VideoControls, VideoControlsListener } from "../components/ui/VideoControls";
import { TempCrop } from "../gfx/CropView";
import { Visual } from "../gfx/Visual";

export interface SettingsChangedListener {
    onColorsChanged(values:string[]);
    onPatternsChanged(values:Texture[]);
    onTilesChanged(value:number);
    onThresholdsChanged(value:Knot[]);
    onVisualSelected(file:File);
    onCropViewChanged(value:boolean);
    onTextureUpdate();
}

export class Controller implements TopBarListener, CardListener, FloatingPanelListener, TilesControllerListener, ThresholdListener, VideoControlsListener {
    loader:HiddeableComponent;

    colorsPanel:ColorPanel;
    patternsPanel:PatternPanel;

    topBar:TopBar;
    exportCtrl:ExportControls;
    videoCtrl:VideoControls;

    threshold:ThresholdController;
    tiles:TilesController;

    menu:Menu;

    selectedColorCard:Card = null;
    selectedPatternCard:Card = null;

    listeners:SettingsChangedListener[] = [];

    constructor() {
        this.loader = new HiddeableComponent(
            document.querySelector('.loading')
        );

        const panels = document.querySelectorAll('.panel');

        this.colorsPanel = new ColorPanel( "colors",
            panels[0] as HTMLElement
        );

        this.patternsPanel = new PatternPanel( "patterns",
            panels[1] as HTMLElement
        );

        this.topBar = new TopBar(document.querySelector('#topbar'));
        this.exportCtrl = new ExportControls(document.querySelector('#export'));
        this.videoCtrl = new VideoControls();

        this.threshold = new ThresholdController();
        this.tiles = new TilesController();

        this.menu = new Menu(document.querySelector('aside'));

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
        this.menu.patterns.addCardListener(this);
        this.tiles.addListener(this);
        this.threshold.addListener(this);
        this.colorsPanel.addListener(this);
        this.patternsPanel.addListener(this);
        this.videoCtrl.addListener(this);

        const cancel = document.querySelector('button._cancel') as HTMLElement;
        const apply = document.querySelector('button._apply') as HTMLElement;

        const cancelFn = () => {
            // restore cropping values
            for(const key in Visual.crop) {
                Visual.crop[key] = TempCrop[key];
            }

            this.topBar.cropping = false;
        }

        cancel.onclick = () => {
            cancelFn();
        }

        apply.onclick = () => {
            this.topBar.cropping = false;
        }

        window.addEventListener('keydown', e => {
            if(e.key === 'Escape') {
                if(!this.topBar.cropping) return;
                cancelFn();
            }
        })

        const input = document.querySelector('input#input_file') as HTMLInputElement;
        input.addEventListener('change', (e) => {
            for(const lis of this.listeners) {
                lis.onVisualSelected(input.files[0]);
            }
        })
    }

    onCropChanged(value: boolean) {
        this.menu.cropping = value;
        this.exportCtrl.active = !value;
        if(value) {
            this.colorsPanel.hide();
            this.patternsPanel.hide();
        }
        for(const lis of this.listeners) {
            lis.onCropViewChanged(value);
        }
    }

    onCardSelected(id: string, card: Card) {
        if(id === 'color') {
            const tile = card.dom.querySelector('.tile') as HTMLElement;
            const colId = tile.getAttribute('card-value');
            // console.log(colId);
            this.selectedColorCard = card;
            this.colorsPanel.show(colId, card.dom);
        } else if (id === 'pattern') {
            const tile = card.dom.querySelector('.tile') as HTMLElement;
            const imgId = tile.getAttribute('card-value');
            // console.log(imgId);
            this.selectedPatternCard = card;
            this.patternsPanel.show(imgId, card.dom);
        }
    }

    onCardSwap(id: string) {
        if(id === 'color') {
            this.fireColorsChanged();
        } else if(id === 'pattern') {
            this.firePatternsChanged();
        }
    }

    onPanelDataChanged(id:string, data:any) {
        if(id === 'colors') {
            if(!this.selectedColorCard) return;
            const tile = this.selectedColorCard.dom.querySelector('.tile') as HTMLElement;
            tile.setAttribute('card-value', data);
            tile.style.backgroundColor = `#${data}`;
            this.fireColorsChanged();
        } else if(id === 'patterns') {
            if(!this.selectedPatternCard) return;
            const tile = this.selectedPatternCard.dom.querySelector('.tile') as HTMLElement;
            tile.setAttribute('card-value', data.value);
            this.menu.patterns.setValue(this.selectedPatternCard.index, data);
        }
    }

    onPanelClosed(id: string) {
        if(id === 'colors') {
            this.selectedColorCard = null;
        } else if(id === 'patterns') {
            this.selectedPatternCard = null;
        }
    }
    
    onTilesChanged(value: number) {
        for(const lis of this.listeners) {
            lis.onTilesChanged(value);
        }
    }

    onThresholdsChanged(values: Knot[]) {
        for(const lis of this.listeners) {
            lis.onThresholdsChanged(values);
        }
    }

    onVideoScrub() {
        for(const lis of this.listeners) {
            lis.onTextureUpdate();
        }
    }

    protected fireColorsChanged() {
        const colors = ["", "", "", ""];
        const cards = this.menu.colors.cards;
        for(const card of cards) {
            const val = card.dom.querySelector('.tile').getAttribute('card-value');
            colors[card.position] = `#${val}`;
            const h3 = card.dom.querySelector('h3');
            h3.textContent = val.toUpperCase();
        }

        this.threshold.colors = colors;

        for(const lis of this.listeners) {
            lis.onColorsChanged(colors);
        }
    }

    protected firePatternsChanged() {
        const textures = [null, null, null, null];
        const cards = this.menu.patterns.cards;
        for(const card of cards) {
            textures[card.position] = this.menu.patterns.patterns[card.index].texture;
        }

        for(const lis of this.listeners) {
            lis.onPatternsChanged(textures);
        }
    }
}