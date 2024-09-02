import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, Texture, VideoTexture, WebGLRenderer, WebGLRenderTarget } from "three";
import { VisualSettings } from "./Visual";
import { TextureLoader } from "three";

const DEFAULT_SIZ = 540;

export interface CropRendererListener {
    onCropRender(texture:Texture);
}

export class CropRenderer {
    rt:WebGLRenderTarget;
    scene:Scene;
    cam:OrthographicCamera;

    visTexture:Texture;

    quad:Mesh;
    quadMat:MeshBasicMaterial;

    rnd:WebGLRenderer;

    listeners:CropRendererListener[] = [];

    constructor(_rnd:WebGLRenderer) {
        this.rnd = _rnd;

        const s = DEFAULT_SIZ;
        this.rt = new WebGLRenderTarget(s, s, {
            samples: 1
        });

        this.scene = new Scene();

        this.quadMat = new MeshBasicMaterial();
        this.quad = new Mesh(
            new PlaneGeometry(1, 1),
            this.quadMat
        )

        this.scene.add(this.quad);
    }

    addListener(lis:CropRendererListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:CropRendererListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    render() {
        if(!this.cam) return;
        this.quadMat.map = this.visTexture;
        
        this.rnd.setRenderTarget(this.rt);
        this.rnd.render(this.scene, this.cam);
        this.rnd.setRenderTarget(null);

        for(const lis of this.listeners) {
            lis.onCropRender(this.rt.texture);
        }
    }

    onVisualUpdate(vis:VisualSettings) {
        const c = vis.crop;
        const cw = c.width;
        const ch = c.height;

        this.rt.setSize(cw, ch);
        this.cam = new OrthographicCamera(-cw/2, cw/2, ch/2, -ch/2, 1, 100);
        this.cam.position.z = 10;

        this.quad.scale.set(vis.originalSize.width, vis.originalSize.height, 1);
        this.quad.position.x = -c.offsetX;
        this.quad.position.y = -c.offsetY;

        
        if(this.visTexture) this.visTexture.dispose();

        if(vis.video) {
            this.visTexture = new VideoTexture(vis.element as HTMLVideoElement);
            this.render();
        } else {
            this.visTexture = new TextureLoader().load(vis.element.src, t => {
                this.render();
            });
        }
    }

    get texture():Texture {
        return this.rt.texture;
    }

    onFrameUpdate() {
        this.render();
    }
}