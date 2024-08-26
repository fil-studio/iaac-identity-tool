import { ThreeDOMLayer, ThreeLayer } from "@fils/gl-dom";
import { UI } from "@fils/ui";
import { uiTexture } from "@fils/ui-icons";
import { OrthographicCamera } from "three";
import { MAT, RenderEngine } from "./RenderEngine";

export class SceneLayer extends ThreeLayer {
    camera:OrthographicCamera;
    needsUpdate:boolean = true;

    engine:RenderEngine;

    constructor(_gl:ThreeDOMLayer) {
        super(_gl);

        const rnd = _gl.renderer;

        const w = this.gl.rect.width;
        const h = this.gl.rect.height;
        this.camera = new OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 100);
        this.scene.add(this.camera);
        this.params.camera = this.camera;

        // this.trPass = new TransmissionDepthPass(this.gl.renderer, w, h, .5);

        this.camera.position.z = 20;

        this.engine = new RenderEngine();
        this.scene.add(this.engine.quad);

        this.initGUI();
    }

    protected initGUI() {
        const gui = new UI({
            title: 'Iaac render settings',
            icon: uiTexture
        })

        const mode = MAT.uniforms.mode;
        gui.add(mode, 'value', {
            title: 'Output step',
            options: {
                '1_original': 0,
                '2_pixelated': 1,
                '3_luma': 2
            }
        })

        const u = MAT.uniforms.settings.value;
        gui.add(u, 'tiles', {
            min: 5,
            max: 100,
            step: 1
        })
    }

    update(time:number, dt:number) {
        
    }

    render(): void {
        if(!this.needsUpdate) return;
        // this.needsUpdate = false;
        this.engine.setSize(this.gl.rect.width, this.gl.rect.height, 100);
        super.render();
    }
}