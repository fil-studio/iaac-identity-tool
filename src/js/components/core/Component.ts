export class Component {
    dom:HTMLElement;

    constructor(_dom:HTMLElement) {
        this.dom = _dom;
    }
}

export class HiddeableComponent extends Component {
    protected _active:boolean = false;

    constructor(_dom:HTMLElement) {
        super(_dom);
        this._active = _dom.classList.contains('active');
    }

    set active(value:boolean) {
        this._active = value;
        if(value) this.dom.classList.add('active');
        else this.dom.classList.remove('active');
    }
}