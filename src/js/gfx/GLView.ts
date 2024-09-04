import { OrthographicCamera, Scene, WebGLRenderer } from "three";
import { VisualSettings } from "./Visual";

export class GLView {
    gl:WebGLRenderer;
    dom:HTMLElement;

    scene:Scene;
    camera:OrthographicCamera;

    _enabled:boolean = false;

    constructor(_dom:HTMLElement) {
        this.dom = _dom;

        this.gl = new WebGLRenderer({
            antialias: false,
            alpha: false
        })
        this.gl.setClearColor(0x111111, 1);
        this.gl.outputColorSpace = 'srgb-linear';
        this.dom.appendChild(this.gl.domElement);

        this.camera = new OrthographicCamera(-1, 1, 1, -1, 1, 100);

        this.scene = new Scene();
    }

    setDomSize(vis:VisualSettings, isCrop:boolean=false) {
        const rect = document.querySelector('.gl').getBoundingClientRect();
        // const rw = rect.width * .9;
        // const rh = rect.height * .65;

        const cratio = vis.crop.width / vis.crop.height;

        const ratio = isCrop ? cratio : vis.ratio;
        let w = isCrop ? vis.crop.width : vis.originalSize.width;
        let h = w / ratio;
        
        /* while(w > rw || h > rh) {
            w -= 10;
            h = w / ratio;
        } */
        
        this.dom.style.width = `${w}px`;
        this.dom.style.height = `${h}px`;
    }

    visualUpdated(vis:VisualSettings, isCrop:boolean=false) {
        this.setDomSize(vis, isCrop);
        
        const w = isCrop ? vis.crop.width : vis.originalSize.width;
        const h = isCrop ? vis.crop.height : vis.originalSize.height;

        this.setSize(w, h);
    }

    setSize(width:number, height:number) {
        const w = width;
        const h = height;

        this.gl.setSize(w, h);

        this.camera = new OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 100);
        this.camera.position.z = 10;
    }

    render() {
        if(!this._enabled) return;
        this.gl.render(this.scene, this.camera);
    }

    set enabled(value:boolean) {
        if(value === this._enabled) return;
        this._enabled = value;
        if(value) {
            this.dom.classList.add('active');
            this.render();
        } else {
            this.dom.classList.remove('active');
        }
    }

    get enabled():boolean {
        return this._enabled;
    }
}