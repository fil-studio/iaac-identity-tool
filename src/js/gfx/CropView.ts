import { MathUtils } from "@fils/math";
import { BlurPass } from "@fils/vfx";
import { Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, Texture, TextureLoader, Vector2, VideoTexture } from "three";
import { GLView } from "./GLView";
import { CropSettings, Visual, VisualSettings } from "./Visual";

let rT;

const raycaster = new Raycaster();
const mouse = new Vector2();
const anchor = new Vector2();
const anchorOff = new Vector2();

const ratios = [1, 16.9, 9/16];

export const TempCrop:CropSettings = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    ratio: 1
}

export function updateRatioDropdown() {
    const ratio = Visual.crop.ratio;
    const r = document.querySelector('select#ratio') as HTMLSelectElement;
    if(ratios.indexOf(ratio) > -1) r.value = `${ratio}`;
    else r.value = 'free';
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

        const changeValue = (axis:'width'|'height') => {
            const c = Visual.crop;
            const siz = Visual.originalSize;

            const r = c.ratio;
            let width, height;

            width = MathUtils.clamp(parseInt(w.value), 256, Visual.originalSize.width);
            height = MathUtils.clamp(parseInt(h.value), 256, Visual.originalSize.height);

            if(c.ratio != null) {
                if(axis === 'width') {
                    height = Math.round(width / r);
                    if(height > Visual.originalSize.height) {
                        height = Visual.originalSize.height;
                        width = Math.round(height * r);
                    }
                } else {
                    width = Math.round(height * r);
                    if(width > Visual.originalSize.width) {
                        width = Visual.originalSize.width;
                        height = Math.round(width / r);
                    }
                }
            }

            c.width = width;
            c.height = height;

            const DW = (siz.width - c.width) * .5;
            const DH = (siz.height - c.height) * .5;

            c.offsetX = MathUtils.clamp(c.offsetX, -DW, DW);
            c.offsetY = MathUtils.clamp(c.offsetY, -DH, DH);

            w.value = `${width}`;
            h.value = `${height}`;

            this.updateCrop();
            this.render();
        }

        w.onchange = () => {
            if(!this._enabled) return;
            changeValue('width');
        }

        h.onchange = () => {
            if(!this._enabled) return;
            changeValue('height');
        }

        const restore = document.querySelector('button.restoreBtn') as HTMLButtonElement;
        restore.onclick = () => {
            const siz = Visual.originalSize;
            const c = Visual.crop;
            c.width = siz.width;
            c.height = siz.height;
            c.offsetX = 0;
            c.offsetY = 0;
            
            c.ratio = ratios.indexOf(Visual.ratio) > -1 ? Visual.ratio : null;

            w.value = `${c.width}`;
            h.value = `${c.height}`;

            this.updateCrop();
            this.render();
            updateRatioDropdown();
        }

        const r = document.querySelector('select#ratio') as HTMLSelectElement;
        r.onchange = () => {
            const c = Visual.crop;
            if(r.value !== 'free') {
                const ratio = parseFloat(r.value);
                c.ratio = ratio;
                if(Visual.ratio > 1) {
                    w.value = `${Visual.originalSize.width}`;
                    changeValue('width');
                } else {
                    h.value = `${Visual.originalSize.height}`;
                    changeValue('height');
                }

            } else {
                c.ratio = null;
            }
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

            updateRatioDropdown();
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