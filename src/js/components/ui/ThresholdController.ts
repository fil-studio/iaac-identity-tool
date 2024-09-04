import { MathUtils } from "@fils/math";

export interface Knot {
    progress:number;
    dom:HTMLElement;
}

const D = .02;

export interface ThresholdListener {
    onThresholdsChanged(values:Knot[]);
}

export class ThresholdController {
    dom:HTMLElement;
    track:HTMLElement;
    trackRect:DOMRect;
    knots:Knot[] = [];

    listeners:ThresholdListener[] = [];

    private dragging:boolean = false;
    private dragTarget:HTMLElement;
    private activeDragArea = {
        min: 0,
        max: .95,
        progMin: 0,
        progMax: 1,
        index: 0
    }

    constructor() {
        this.dom = document.querySelector("label#threshold");

        this.track = this.dom.querySelector('div.input_threshold');
        this.trackRect = this.track.getBoundingClientRect();

        const stopDrag = () => {
            this.stopDrag();
        }

        const k = this.dom.querySelectorAll('div.knot');
        let i = 0;
        for(const knt of k) {
            const dom = knt as HTMLElement;
            const knot = {
                progress: (i*.25 + .125),
                dom
            };

            this.knots.push(knot)

            i++;

            dom.onmousedown = () => {
                this.startDrag(knot);
            }
        }

        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('mouseleave', stopDrag);

        window.addEventListener('mousemove', e => {
            this.drag(e.clientX);
        });

        this.updateKnotPositions();

        const r = this.dom.querySelector('button.jsThRestart').querySelector('svg');
        r.addEventListener('click', e => {
            this.reset();
        })
    }

    reset() {
        this.stopDrag();
        for(let i=0;i<4; i++) {
            this.knots[i].progress = (i*.25 + .125);
        }

        this.updateKnotPositions();
        this.broadcastChange();
    }

    addListener(lis:ThresholdListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:ThresholdListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    set colors(value:string[]) {
        for(let i=0; i<4; i++) {
            this.knots[i].dom.style.backgroundColor = value[i];
        }
    }

    protected updateKnotPositions(ignoreKnot:Knot=null) {
        for(const knot of this.knots) {
            if(knot === ignoreKnot) continue;
            knot.dom.style.left = `${knot.progress*95}%`;
        }
    }

    protected startDrag(target:Knot) {
        if(this.dragging) return;
        this.dragging = true;
        this.dragTarget = target.dom;
        this.dragTarget.classList.add('grabbing');

        const index = this.knots.indexOf(target);

        this.activeDragArea.index = index;
        this.activeDragArea.min = index * D;
        this.activeDragArea.max = .95 - (3 -index) * D;
        this.activeDragArea.progMin = index * D;
        this.activeDragArea.progMax = 1 - (3 -index) * D;
        // console.log(this.activeDragArea)
    }

    protected stopDrag() {
        if(!this.dragging) return;
        this.dragging = false;
        this.dragTarget.classList.remove('grabbing');
        this.dragTarget = null;
    }

    protected drag(x:number) {
        if(!this.dragging) return;
        const p = MathUtils.smoothstep(this.trackRect.x, this.trackRect.x + this.trackRect.width, x);
        const pd = MathUtils.lerp(this.activeDragArea.min, this.activeDragArea.max, p);
        const pp = MathUtils.lerp(this.activeDragArea.progMin, this.activeDragArea.progMax, p);

        const k = this.activeDragArea.index;
        const k1 = this.knots[k];

        if(pp === k1.progress) return;
        
        this.dragTarget.style.left = `${pp*95}%`

        k1.progress = pp;

        for(let i=0; i<k; i++) {
            const k2 = this.knots[i];
            const p2 = k1.progress - (k-i) * D;
            if(k2.progress >= p2) {
                k2.progress = p2;
                k2.dom.style.left = `${p2*95}%`
            }
        }

        for(let i=k+1; i<4; i++) {
            const k2 = this.knots[i];
            const p2 = k1.progress + (i-k) * D;
            if(k2.progress < p2) {
                k2.progress = p2;
                k2.dom.style.left = `${p2*95}%`
            }
        }

        this.broadcastChange();
    }

    protected broadcastChange() {
        for(const lis of this.listeners) {
            lis.onThresholdsChanged(this.knots);
        }
    }
}