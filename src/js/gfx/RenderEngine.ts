import { Color, LinearFilter, Mesh, PlaneGeometry, ShaderMaterial, Texture, TextureLoader, Vector2, VideoTexture } from "three";
import fragmentShader from "../../glsl/shader.frag";
import vertexShader from "../../glsl/shader.vert";
import { Knot } from "../components/ui/ThresholdController";
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
                        color: new Color(0xFF71EB).convertLinearToSRGB(),
                        t0: 0,
                        t1: .25
                    },
                    {
                        map: null,
                        color: new Color(0xFFD302).convertLinearToSRGB(),
                        t0: .25,
                        t1: .5
                    },
                    {
                        map: null,
                        color: new Color(0xA057FF).convertLinearToSRGB(),
                        t0: .5,
                        t1: .75
                    },
                    {
                        map: null,
                        color: new Color(0x53565E).convertLinearToSRGB(),
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
    }

    set patterns(patterns:Texture[]) {
        const u = MAT.uniforms.settings.value.tiles;
        for(let i=0 ;i<u.length; i++) {
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
        console.log(value);
        const d1 = (value[1].progress - value[0].progress);
        const d2 = d1 + (value[2].progress - value[1].progress);
        const d3 = d2 + (value[3].progress - value[2].progress);

        // console.log(d1, d2, d3);
        
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

    /* protected disposeTextrueInput() {
        if(MAT.uniforms.tInput.value != null) {
            MAT.uniforms.tInput.value.dispose();
            MAT.uniforms.tInput.value = null;
        }
    } */

    /* loadVideo(url:string) {
        this.disposeTextrueInput();
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        let created = false;
        video.addEventListener('canplaythrough', e => {
            if(created) {
                return;
            }
            created = true;
            video.play();
            const texture = new VideoTexture(video);
            MAT.uniforms.tInput.value = texture;
            this.updateTextureSettings(texture);
            this.updateResolution(true);    
        });
        video.src = url;
    }

    loadImage(url:string) {
        this.disposeTextrueInput();
        tLoader.load(url, texture => {
            this.updateTextureSettings(texture);
            MAT.uniforms.tInput.value = texture;
            this.updateResolution();
        });
    } */

    /* setSize(width:number, height:number, margin:number) {
        const w = width - 2 * margin;
        const h = height - 2 * margin;

        const sr = width / height;

        if(sr > this.ratio) {
            this.quad.scale.y = h;
            this.quad.scale.x = h * this.ratio;
        } else {
            this.quad.scale.x = w;
            this.quad.scale.y = w / this.ratio;
        }
    } */
}