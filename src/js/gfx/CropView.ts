import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, Texture, TextureLoader, VideoTexture, WebGLRenderer, WebGLRenderTarget } from "three";
import { Visual, VisualSettings } from "./Visual";
import { BlurPass } from "@fils/vfx";

let rT;

export class CropView {
    gl:WebGLRenderer;
    dom:HTMLElement;

    scene:Scene;
    camera:OrthographicCamera;

    texture:Texture;
    blur:BlurPass;

    bg:Mesh;
    bgMat:MeshBasicMaterial;
    
    crop:Mesh;
    cropMat:MeshBasicMaterial;

    _enabled:boolean = true;

    constructor(_dom:HTMLElement) {
        this.dom = _dom;

        this.gl = new WebGLRenderer({
            antialias: false,
            alpha: false
        })
        this.gl.setClearColor(0x999999, 1);
        this.gl.outputColorSpace = 'srgb-linear';
        this.dom.appendChild(this.gl.domElement);

        this.scene = new Scene();

        window.addEventListener('resize', e => {
            clearTimeout(rT);
            rT = setTimeout(() => {
                this.setDomSize(Visual);
            }, 100);
        });

        this.bgMat = new MeshBasicMaterial();
        this.bg = new Mesh(
            new PlaneGeometry(1,1),
            this.bgMat
        );
        this.scene.add(this.bg);

        this.cropMat = new MeshBasicMaterial();
        this.crop = new Mesh(
            new PlaneGeometry(1,1),
            this.cropMat
        );
        this.scene.add(this.crop);
        this.crop.position.z = 1;
    }

    setDomSize(vis:VisualSettings) {
        const rect = document.querySelector('.gl').getBoundingClientRect();
        const rw = rect.width * .9;
        const rh = rect.height * .65;

        const ratio = vis.ratio;
        let w = vis.originalSize.width;
        let h = w / ratio;
        
        while(w > rw || h > rh) {
            w -= 100;
            h = w / ratio;
        }
        
        this.dom.style.width = `${w}px`;
        this.dom.style.height = `${h}px`;
    }

    visualUpdated(vis:VisualSettings) {
        this.setDomSize(vis);
        
        const w = vis.originalSize.width;
        const h = vis.originalSize.height;

        this.gl.setSize(w, h);

        this.camera = new OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 100);
        this.camera.position.z = 10;

        if(this.texture) this.texture.dispose();
        if(this.blur) this.blur.dispose();

        if(vis.video) {
            this.texture = new VideoTexture(vis.element as HTMLVideoElement);
        } else {
            this.texture = new TextureLoader().load(vis.element.src, t => {
                this.render();
            });
        }

        this.blur = new BlurPass(this.texture, w, h, {
            scale: .5,
            radius: 2,
            iterations: 16,
            quality: 2
        });

        this.bg.scale.set(w, h, 1);
        this.bgMat.map = this.blur.texture;

        const c = vis.crop;
        this.crop.position.set(c.offsetX, c.offsetY, 1);
        this.crop.scale.set(c.width, c.height, 1);
        this.cropMat.map = this.texture;

        const dx = (vis.originalSize.width - c.width) / vis.originalSize.width;
        const dy = (vis.originalSize.height - c.height) / vis.originalSize.height;

        const uv = this.crop.geometry.attributes.uv;
        uv.array[0] = dx/2;
        uv.array[1] = 1 - dy/2;

        uv.array[2] = 1 - dx/2;
        uv.array[3] = 1 - dy/2;

        uv.array[4] = dx/2;
        uv.array[5] = dy/2;

        uv.array[6] = 1 - dx/2;
        uv.array[7] = dy/2;

        uv.needsUpdate = true;

        this.render();
    }

    render() {
        if(!this._enabled) return;
        this.blur.renderInternal(this.gl);
        this.gl.setRenderTarget(null);
        this.gl.render(this.scene, this.camera);
    }

    set enabled(value:boolean) {
        this._enabled = value;
        if(value) this.render();
    }

    get enabled():boolean {
        return this._enabled;
    }
}