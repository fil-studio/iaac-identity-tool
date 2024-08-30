import { Texture } from "three";
import { CropRenderer, CropRendererListener } from "./CropRenderer";
import { GLView } from "./GLView";
import { RenderEngine } from "./RenderEngine";
import { CropSettings, Visual, VisualSettings } from "./Visual";
import { TempCrop } from "./CropView";

export function equalCrops(c1:CropSettings, c2:CropSettings):boolean {
    return c1.height === c2.height && 
    c1.width === c2.width &&
    c1.offsetX === c2.offsetX &&
    c1.offsetY === c2.offsetY;
}

export class ExportView extends GLView implements CropRendererListener {
    engine:RenderEngine;
    crop:CropRenderer;

    constructor(_dom:HTMLElement) {
        super(_dom);

        this.crop = new CropRenderer(this.gl);
        this.engine = new RenderEngine();
        
        this.scene.add(this.engine.quad);

        this.crop.addListener(this);
    }

    set enabled(value:boolean) {
        super.enabled = value;
        if(this._enabled) {
            const c1 = Visual.crop;
            const c2 = TempCrop;
            if(!equalCrops(c1, c2)) {
                this.crop.onVisualUpdate(Visual);
            }
        }
    }

    visualUpdated(vis: VisualSettings, isCrop?: boolean): void {
        super.visualUpdated(vis, isCrop);
        this.engine.updateResolution(vis.crop.width, vis.crop.height);
        this.crop.onVisualUpdate(vis);
    }

    onCropRender(texture: Texture) {
        this.engine.texture = texture;
        this.render();
    }
}