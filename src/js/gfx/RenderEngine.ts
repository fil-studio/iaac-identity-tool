import { Color, LinearFilter, Mesh, PlaneGeometry, ShaderMaterial, Texture, TextureLoader, Vector2, VideoTexture } from "three";
import fragmentShader from "../../glsl/shader.frag";
import vertexShader from "../../glsl/shader.vert";
import { Knot } from "../components/ui/ThresholdController";
import { SCOPE } from "../core/Globals";
// import { RTUtils } from "@fils/gfx";

const tLoader = new TextureLoader();
const geo = new PlaneGeometry(1,1);

export const MAT = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        resolution: {
            value: new Vector2()
        },
        settings: {
            value: {
                columns: 30,
                tiles: [
                    {
                        map: null,
                        color: new Color(0xFFFFFF).convertLinearToSRGB(),
                        t0: 0,
                        t1: .25
                    },
                    {
                        map: null,
                        color: new Color(0xCECECE).convertLinearToSRGB(),
                        t0: .25,
                        t1: .5
                    },
                    {
                        map: null,
                        color: new Color(0xFF71EB).convertLinearToSRGB(),
                        t0: .5,
                        t1: .75
                    },
                    {
                        map: null,
                        color: new Color(0xB2381C).convertLinearToSRGB(),
                        t0: .75,
                        t1: 1.0
                    }
                ]
            }
        },
        tInput: {
            value: null
        },
        mode: {
            value: 3
        }
    }
});

export class RenderEngine {
    ratio:number;
    quad:Mesh;

    constructor() {
        this.quad = new Mesh(geo, MAT);
        SCOPE.engine = this;
    }

    set patterns(patterns:Texture[]) {
        const u = MAT.uniforms.settings.value.tiles;
        for(let i=0 ;i<u.length; i++) {
            this.updateTextureSettings(patterns[i])
            u[i].map = patterns[i];
        }
    }

    set texture(value:Texture) {
        this.updateTextureSettings(value);
        MAT.uniforms.tInput.value = value;
    }

    set tiles(value:number) {
        MAT.uniforms.settings.value.columns = value;
    }

    set thresholds(value:Knot[]) {
        const tiles = MAT.uniforms.settings.value.tiles;
        const d1 = (value[1].progress - value[0].progress);
        const d2 = d1 + (value[2].progress - value[1].progress);
        const d3 = d2 + (value[3].progress - value[2].progress);

        tiles[0].t1 = d1;
        tiles[1].t0 = d1;
        tiles[1].t1 = d2;
        tiles[2].t0 = d2;
        tiles[2].t1 = d3;
        tiles[3].t0 = d3;
    }

    updateResolution(width:number, height:number) {
        const u = MAT.uniforms;
        const res = u.resolution.value;
        
        res.set(width, height);

        this.quad.scale.set(width, height, 1);

        this.ratio = res.x / res.y;
        // console.log('image ratio', this.ratio);
    }

    protected updateTextureSettings(texture:Texture) {
        texture.magFilter = LinearFilter;
        texture.minFilter = LinearFilter;
    }

    setColors(colors:string[]) {
        const tiles = MAT.uniforms.settings.value.tiles;
        for(let i=0; i<tiles.length; i++) {
            tiles[i].color.setStyle(colors[i]).convertLinearToSRGB();
        }
    }
}