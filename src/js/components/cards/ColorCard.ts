import { ColorPanel } from '../panels/ColorPanel';

export class ColorCard {
    private dom: HTMLElement;
    private tiles: NodeListOf<HTMLElement>;
    private colorPanel: ColorPanel;

    constructor(_dom: HTMLElement) {
        this.dom = _dom;
        this.tiles = _dom.querySelectorAll('.pattern_composer .tile');
        const panelElement = document.getElementById('panel-color');
        if (panelElement) {
            this.colorPanel = new ColorPanel(panelElement);
        }
        this.init();
    }

    private init() {
        this.tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const color = tile.getAttribute('data-color');
                if (color) {
                    this.colorPanel.setTile(tile);
                    this.colorPanel.show(color);
                }
            });
        });
    }
}
