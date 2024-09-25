import { el } from "@fils/utils";
import { CanvasTexture, LinearFilter } from "three";
import { CardContainer } from "./CardContainer";
import { SCOPE } from "../../../core/Globals";

const SIZ = 256;

export interface Pattern {
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    texture:CanvasTexture;
    index:number;
    inverted:boolean;
}

export interface PatternDef {
    value:string;
    index:number;
}

export class PatternCards extends CardContainer {
    patterns:Pattern[] = [];

    constructor(_dom:HTMLElement) {
        super("pattern", _dom);

        SCOPE.patterns = this;

        const tiles = _dom.querySelectorAll('.tile');
        let i = 0;
        for(const tile of tiles) {
            tile.setAttribute('card-value', `${i}`);
            const canvas = el('canvas') as HTMLCanvasElement;
            const ctx = canvas.getContext('2d', {
                willReadFrequently: true
            });
            canvas.width = SIZ;
            canvas.height = SIZ;
            tile.appendChild(canvas);

            const texture = new CanvasTexture(canvas);
            texture.minFilter = LinearFilter;
            texture.magFilter = LinearFilter;

            this.patterns.push({
                canvas,
                ctx,
                texture,
                index: 0,
                inverted: false
            });

            // i++
        }

        for(let i=0; i<4; i++) {
            this.initImage(i);
        }
    }

    protected addTileEvents(): void {
        let ctrl = false;
        window.addEventListener('keydown', e => {
            if(e.key === 'Alt') ctrl = true;
        });
        window.addEventListener('keyup', e => {
            if(e.key === 'Alt') ctrl = false;
        });

        const tiles = this.dom.querySelectorAll('.tile');
        for(let i=0; i<tiles.length; i++) {
            const t = tiles[i] as HTMLElement;
            t.onclick = () => {
                if(ctrl) {
                    this.invertImage(i);
                } else {
                    for(const lis of this.listeners) {
                        lis.onCardSelected(this.id, this.cards[i]);
                    }
                }
            }
        }
    }

    setValue(i:number, data:PatternDef) {
        const img = new Image();
        const value = data.value;
        // console.log(data.index)
        img.onload = () => {
            this.drawImage(i, img);
        }
        if(value.indexOf('blob') > -1) {
            img.src = value
        } else {
            img.src = `assets/patterns/pattern-${value}.svg`
        }

        this.patterns[i].index = data.index;
        this.patterns[i].inverted = false;
    }

    protected initImage(i:number) {
        const img = new Image();
        img.onload = () => {
            this.drawImage(i, img);
            this.invertImage(i);
        }
        img.src = `assets/patterns/pattern-0.svg`
    }

    protected drawImage(i:number, img:HTMLImageElement) {
        // console.log('draw image', i)
        const p = this.patterns[i];
        const ctx = p.ctx;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, SIZ, SIZ);
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, SIZ, SIZ);

        this.updateTexture(i);
    }

    protected invertImage(i:number) {
        const p = this.patterns[i];
        const ctx = p.ctx;

        const imgData = ctx.getImageData(0, 0, SIZ, SIZ);
        const data = imgData.data;
        for (let k = 0; k < SIZ * SIZ; k++) {
            data[k*4] = 255 - data[k*4];
            data[k*4 + 1] = 255 - data[k*4 + 1];
            data[k*4 + 2] = 255 - data[k*4 + 2];
            data[k*4 + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);

        this.updateTexture(i);

        this.patterns[i].inverted = !this.patterns[i].inverted;
    }

    protected updateTexture(i:number) {
        const p = this.patterns[i];
        p.texture.needsUpdate = true;

        for(const lis of this.listeners) {
            lis.onCardSwap(this.id);
        }
    }

    get svgSupported():boolean {
        for(let i=0; i<4; i++) {
            const index = this.patterns[i].index;
            if(SCOPE.patternsPanel.svgContents[index] === null) return false;
        }

        return true;
    }
}