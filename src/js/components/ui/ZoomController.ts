import { MathUtils } from "@fils/math";
import { el } from "@fils/utils";

const MIN = .25;
const MAX = 2;
const SPEED = .001;

class ZoomClass {
    protected _dom:HTMLElement = null;
    protected factor:number = .5;

    set dom(value:HTMLElement) {
        if(this._dom) {
            console.warn('Zoom already initialized!');
            return;
        }

        this._dom = value;

        const custom = el('option') as HTMLOptionElement;
        custom.hidden = true;

        const sel = this._dom.querySelector('select');
        sel.add(custom);

        sel.onchange = () => {
            const v = Number(sel.value.replace('%', '')) / 100;
            this.updateZoomValue(v);
        }

        window.addEventListener('wheel', e => {
            // console.log(e.deltaY);
            this.updateZoomValue(this.factor + e.deltaY * SPEED);
            const val = Math.round(this.factor*100);
            custom.value = `${val}%`;
            custom.textContent = `${val}%`;
            sel.value = custom.value;
        })
    }

    protected updateZoomValue(value:number) {
        if(this._dom.classList.contains('disabled')) return;
        const newValue = MathUtils.clamp(value, MIN, MAX);
        this.factor = newValue;

        const view = document.querySelector('.gl').querySelector('.view') as HTMLElement;
        view.style.transform = `scale(${this.factor})`;

        const sel = this._dom.querySelector('select');
        const val = Math.floor(100*this.factor);
        // console.log(val);

        // sel.value = `${val}%`;
    }
}
export const Zoom = new ZoomClass();