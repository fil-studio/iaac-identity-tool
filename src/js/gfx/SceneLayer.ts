import { ThreeDOMLayer, ThreeLayer } from "@fils/gl-dom";
import { UI } from "@fils/ui";
import { uiTexture } from "@fils/ui-icons";
import { Color, OrthographicCamera } from "three";
import { MAT, RenderEngine } from "./RenderEngine";

export class SceneLayer extends ThreeLayer {
    camera:OrthographicCamera;
    needsUpdate:boolean = true;

    engine:RenderEngine;

    constructor(_gl:ThreeDOMLayer) {
        super(_gl);

        const w = this.gl.rect.width;
        const h = this.gl.rect.height;
        this.camera = new OrthographicCamera(-w/2, w/2, h/2, -h/2, 1, 100);
        this.scene.add(this.camera);
        this.params.camera = this.camera;

        this.camera.position.z = 20;

        // this.engine = new RenderEngine();
        // this.scene.add(this.engine.quad);

        // this.initGUI();
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
                '3_luma': 2,
                '4_comp': 3
            }
        })

        const u = MAT.uniforms.settings.value;
        gui.add(u, 'columns', {
            title: 'Tile Columns',
            min: 5,
            max: 100,
            step: 1
        })

        const f = gui.addGroup({
            title: 'Colors'
        });
        let i = 0;
        const tmp = new Color();
        for(const t of u.tiles) {
            tmp.copy(t.color).convertSRGBToLinear();
            const col = {
                hex: `#${tmp.getHexString()}`
            }
            f.add(col, 'hex', {
                view: 'color',
                title: `Color ${i++}`
            }).on('change', () => {
                t.color.setStyle(col.hex).convertLinearToSRGB();
            })
        }

        const th = {
            t0: 0,
            t1: .25,
            t2: .5,
            t3: .75
        }

        const updateThresholds = () => {
            u.tiles[0].t0 = th.t0;
            u.tiles[0].t1 = th.t1;
            
            u.tiles[1].t0 = th.t1;
            u.tiles[1].t1 = th.t2;

            u.tiles[2].t0 = th.t2;
            u.tiles[2].t1 = th.t3;

            u.tiles[3].t0 = th.t3;
            u.tiles[3].t1 = 1;
        }

        const f2 = gui.addGroup({
            title: 'Thresholds',
            folded: true
        });

        const addTh = (key) => {
            f2.add(th, key, {
                min: 0,
                max: 1,
                step: .001
            }).on('change', updateThresholds);
        }

        addTh('t0');
        addTh('t1');
        addTh('t2');
        addTh('t3');
    }

    update(time:number, dt:number) {
        
    }

    render(): void {
        if(!this.needsUpdate) return;
        // this.needsUpdate = false;
        // this.engine.setSize(this.gl.rect.width, this.gl.rect.height, 100);
        super.render();
    }

    loadVisual(url:string, isVideo:boolean=false) {
        if(isVideo) this.engine.loadVideo(url);
        else this.engine.loadImage(url);
    }
}