import { Texture } from "three";
import { CropRenderer, CropRendererListener } from "./CropRenderer";
import { GLView } from "./GLView";
import { RenderEngine } from "./RenderEngine";
import { VisualSettings } from "./Visual";

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