import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, Texture, TextureLoader, VideoTexture, WebGLRenderer, WebGLRenderTarget } from "three";
import { Visual, VisualSettings } from "./Visual";
import { BlurPass } from "@fils/vfx";
import { GLView } from "./GLView";

let rT;

export class CropView extends GLView {
    texture:Texture;
    blur:BlurPass;

    bg:Mesh;
    bgMat:MeshBasicMaterial;
    
    crop:Mesh;
    cropMat:MeshBasicMaterial;

    constructor(_dom:HTMLElement) {
        super(_dom);

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

    visualUpdated(vis:VisualSettings) {
        super.visualUpdated(vis);

        const w = vis.originalSize.width;
        const h = vis.originalSize.height;

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
}