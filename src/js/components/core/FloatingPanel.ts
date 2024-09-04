import { HiddeableComponent } from "./Component";

export interface ScreenCoord {
    x:number;
    y:number;
}

export interface FloatingPanelListener {
    onPanelClosed?(id:string);
    onPanelDataChanged?(id:string, data:any);
}

export class FloatingPanel extends HiddeableComponent {
    anchor:ScreenCoord;
    position:ScreenCoord;
    anchorPosition:ScreenCoord;
    dragging:boolean = false;

    listeners:FloatingPanelListener[] = [];

    id:string;
    
    constructor(_id:string, _dom:HTMLElement) {
        super(_dom);

        this.id = _id;

        const active = this._active;
        this.active = true;

        const head = _dom.querySelector('.panel-head') as HTMLElement;
        const close = head.querySelector('.close') as HTMLElement;

        const box = _dom.getBoundingClientRect();
        this.position = {
            x: box.x,
            y: box.y
        }

        close.onclick = () => {
            this.close();
        }

        head.addEventListener('mousedown', e => {
            if(e.target === close) return;
            this.startDrag(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', e => {
            if(e.target === close) return;
            this.drag(e.clientX, e.clientY);
        });

        window.addEventListener('mouseup', e => {
            if(e.target === close) return;
            this.stopDrag();
        });

        window.addEventListener('keydown', e => {
            if(e.key === 'Escape') {
                this.close();
            }
        })

        this.active = active;
    }

    setPositionToElement(el:HTMLElement) {
        const rect = el.getBoundingClientRect();
        const x = rect.x + rect.width + 20;
        const y = rect.y;
        this.position.x = x;
        this.position.y = y;
        this.updatePosition();
    }

    close() {
        if(!this.active) return;
        this.active = false;
        for(const lis of this.listeners) {
            lis?.onPanelClosed(this.id);
        }
    }

    addListener(lis:FloatingPanelListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:FloatingPanelListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    protected startDrag(x: number, y: number) {
        if(this.dragging) return;
        this.dragging = true;
        this.anchor = {
            x,
            y
        }

        this.anchorPosition = {
            x: this.position.x,
            y: this.position.y
        }
    }

    protected stopDrag() {
        if(!this.dragging) return;
        this.dragging = false;
    }

    protected drag(x: number, y: number) {
        if(!this.dragging) return;
        const dx = x - this.anchor.x;
        const dy = y - this.anchor.y;

        this.position.x = this.anchorPosition.x + dx;
        this.position.y = this.anchorPosition.y + dy;

        this.updatePosition();
    }

    updatePosition() {
        this.dom.style.left = `${this.position.x}px`;
        this.dom.style.top = `${this.position.y}px`;
    }
}