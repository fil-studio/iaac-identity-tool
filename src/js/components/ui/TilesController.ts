import { MathUtils } from "@fils/math";

const MAX = 300;
const MIN = 10;

export interface TilesControllerListener {
    onTilesChanged(value:number);
}

export class TilesController {
    dom:HTMLElement;
    num:HTMLElement;
    dragger:HTMLElement;
    track:HTMLElement;
    trackRect:DOMRect;
    protected _value:number = 30;

    private dragging:boolean = false;

    listeners:TilesControllerListener[] = [];

    // protected 

    constructor() {
        this.dom = document.querySelector("label#tiles");
        this.num = this.dom.querySelector("span.num");

        this.dragger = this.dom.querySelector("div.knot");
        this.num.textContent = `${this._value}`;

        this.track = this.dom.querySelector("div.track");
        this.trackRect = this.track.getBoundingClientRect();

        this.dragger.style.left = `${this.getDraggerP()*100}%`

        this.dragger.onmousedown = () => {
            this.startDrag();
        }

        window.addEventListener('mouseup', e => {
            this.stopDrag();
        });

        window.addEventListener('mouseleave', e => {
            this.stopDrag();
        });

        window.addEventListener('mousemove', e => {
            this.drag(e.clientX);
        });
    }

    addListener(lis:TilesControllerListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:TilesControllerListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    protected startDrag() {
        if(this.dragging) return;
        this.dragging = true;
        this.dragger.classList.add('grabbing');
    }

    protected stopDrag() {
        if(!this.dragging) return;
        this.dragging = false;
        this.dragger.classList.remove('grabbing');
    }

    protected drag(x:number) {
        if(!this.dragging) return;
        const p = MathUtils.smoothstep(this.trackRect.x, this.trackRect.x + this.trackRect.width, x);
        this.dragger.style.left = `${p*100*.95}%`

        const v = this._value;
        this._value = Math.round(MathUtils.lerp(MIN, MAX, p));
        this.num.textContent = `${this._value}`;

        if(v !== this._value) {
            for (const lis of this.listeners) {
                lis.onTilesChanged(this._value);
            }
        }
    }

    protected getDraggerP() {
        return MathUtils.smoothstep(MIN, MAX, this._value) * .95;
    }
}