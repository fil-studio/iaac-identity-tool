import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Raycaster, Scene, Texture, TextureLoader, Vector2, VideoTexture, WebGLRenderer, WebGLRenderTarget } from "three";
import { CropSettings, Visual, VisualSettings } from "./Visual";
import { BlurPass } from "@fils/vfx";
import { GLView } from "./GLView";
import { MathUtils } from "@fils/math";

let rT;

const raycaster = new Raycaster();
const mouse = new Vector2();
const anchor = new Vector2();
const anchorOff = new Vector2();

export const TempCrop:CropSettings = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    ratio: 1
}

export class CropView extends GLView {
    texture:Texture;
    blur:BlurPass;

    bg:Mesh;
    bgMat:MeshBasicMaterial;
    
    crop:Mesh;
    cropMat:MeshBasicMaterial;

    hover:boolean = false;
    dragging:boolean = false;

    constructor(_dom:HTMLElement) {
        super(_dom);

        window.addEventListener('resize', e => {
            clearTimeout(rT);
            rT = setTimeout(() => {
                this.setDomSize(Visual);
            }, 100);
        });

        this.bgMat = new MeshBasicMaterial({
            transparent: true,
            opacity: 0.5
        });
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

        const w =  document.querySelector('input#width') as HTMLInputElement;
        const h =  document.querySelector('input#height') as HTMLInputElement;

        const canvas = document.querySelector('.visual-crop-base') as HTMLElement;

        canvas.addEventListener('mousemove', e => {
            if(!this._enabled) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.x;
            const y = e.clientY - rect.y;
            mouse.set(-1 + 2 * x / rect.width, 1 - 2 * y / rect.height);
            raycaster.setFromCamera(mouse, this.camera);
            const i = raycaster.intersectObject(this.crop);

            this.hover = i.length > 0;
            canvas.style.cursor = this.hover ? 'move' : 'default';
        });

        canvas.addEventListener('mousedown', e => {
            if(!this._enabled) return;
            if(!this.hover) return;
            this.startDrag(e.clientX, e.clientY)
        });

        canvas.addEventListener('mousemove', e => {
            if(!this._enabled) return;
            if(!this.hover) return;
            this.drag(e.clientX, e.clientY)
        });

        window.addEventListener('mouseup', e => {
            this.stopDrag();
        })

        window.addEventListener('mouseleave', e => {
            this.stopDrag();
        })

        w.onchange = () => {
            if(!this._enabled) return;
            const realW = MathUtils.clamp(parseInt(w.value), 256, Visual.originalSize.width);
            w.value = `${realW}`;
            
            Visual.crop.width = realW;

            this.updateCrop();
            this.render();
        }

        h.onchange = () => {
            if(!this._enabled) return;
            const realH = MathUtils.clamp(parseInt(h.value), 256, Visual.originalSize.height);
            h.value = `${realH}`;
            
            Visual.crop.height = realH;

            this.updateCrop();
            this.render();
        }
    }

    startDrag(x:number, y:number) {
        if(this.dragging) return;
        this.dragging = true;
        anchor.set(x, y);
        anchorOff.set(Visual.crop.offsetX, Visual.crop.offsetY);
    }

    stopDrag() {
        this.dragging = false;
    }

    drag(x:number, y:number) {
        if(!this.dragging) return;

        const dx = x - anchor.x;
        const dy = y - anchor.y;

        let oX = anchorOff.x + dx;
        let oY = anchorOff.y - dy;

        const DW = (Visual.originalSize.width - Visual.crop.width) * .5;
        const DH = (Visual.originalSize.height - Visual.crop.height) * .5;

        oX = MathUtils.clamp(oX, -DW, DW);
        oY = MathUtils.clamp(oY, -DH, DH);

        Visual.crop.offsetX = oX;
        Visual.crop.offsetY = oY;

        this.updateCrop();
        this.render();
    }

    set enabled(value:boolean) {
        super.enabled = value;
        this.hover = false;
        this.dragging = false;
        if(this._enabled) {
            const w =  document.querySelector('input#width') as HTMLInputElement;
            const h =  document.querySelector('input#height') as HTMLInputElement;

            w.value = `${Visual.crop.width}`;
            h.value = `${Visual.crop.height}`;

            // store current values
            for(const key in Visual.crop) {
                TempCrop[key] = Visual.crop[key];
            }

            this.updateCrop();
            this.render();
        }
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

        this.updateCrop(vis);

        this.render();
    }

    updateCrop(vis:VisualSettings=Visual) {
        const c = vis.crop;
        this.crop.position.set(c.offsetX, c.offsetY, 1);
        this.crop.scale.set(c.width, c.height, 1);
        this.cropMat.map = this.texture;

        const dx = (vis.originalSize.width - c.width) / vis.originalSize.width;
        const dy = (vis.originalSize.height - c.height) / vis.originalSize.height;

        const dx2 = c.offsetX / vis.originalSize.width;
        const dy2 = c.offsetY / vis.originalSize.height;

        const uv = this.crop.geometry.attributes.uv;
        uv.array[0] = dx/2 + dx2;
        uv.array[1] = 1 - dy/2 + dy2;

        uv.array[2] = 1 - dx/2 + dx2;
        uv.array[3] = 1 - dy/2 + dy2;

        uv.array[4] = dx/2 + dx2;
        uv.array[5] = dy/2 + dy2;

        uv.array[6] = 1 - dx/2 + dx2;
        uv.array[7] = dy/2 + dy2;

        uv.needsUpdate = true;
    }

    render() {
        if(!this._enabled) return;
        this.blur.renderInternal(this.gl);
        this.gl.setRenderTarget(null);
        this.gl.render(this.scene, this.camera);
    }
}