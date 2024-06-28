import { ThreeDOMLayer, ThreeLayer } from "@fils/gl-dom";
import { OrthographicCamera } from "three";

export class SceneLayer extends ThreeLayer {
    camera:OrthographicCamera;

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
    }

    update(time:number, dt:number) {
        
    }
}