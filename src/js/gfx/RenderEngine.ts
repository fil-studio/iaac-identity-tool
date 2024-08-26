import vertexShader from "../../glsl/shader.vert";
import fragmentShader from "../../glsl/shader.frag";
import { Color, LinearFilter, Mesh, NearestFilter, NearestMipMapLinearFilter, PlaneGeometry, ShaderMaterial, TextureLoader, Vector2 } from "three";
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
                        map: tLoader.load('assets/patterns/pattern-1.svg'),
                        color: new Color(0xFF71EB),
                        t0: 0,
                        t1: .25
                    },
                    {
                        map: tLoader.load('assets/patterns/pattern-2.svg'),
                        color: new Color(0xFFD302),
                        t0: .25,
                        t1: .5
                    },
                    {
                        map: tLoader.load('assets/patterns/pattern-3.svg'),
                        color: new Color(0xA057FF),
                        t0: .5,
                        t1: .75
                    },
                    {
                        map: tLoader.load('assets/patterns/pattern-4.svg'),
                        color: new Color(0x53565E),
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
        },
        alphaBlend: {
            value: .2
        }
    }
});

export class RenderEngine {
    ratio:number;
    quad:Mesh;

    constructor() {
        this.loadTestImage('assets/test/test-image.jpg');

        this.quad = new Mesh(geo, MAT);
    }

    protected loadTestImage(url:string) {
        tLoader.load(url, texture => {
            texture.magFilter = LinearFilter;
            texture.minFilter = LinearFilter;
            MAT.uniforms.tInput.value = texture;
            this.updateResolution();
        });
    }

    protected updateResolution(isVideo:boolean=false) {
        const u = MAT.uniforms;
        const src = u.tInput.value;
        const res = u.resolution.value;

        if(isVideo) {
            const video = src.image as HTMLVideoElement;
            res.set(video.videoWidth, video.videoHeight);
        } else {
            const img = src.image as HTMLImageElement;
            res.set(img.width, img.height);
        }

        this.ratio = res.x / res.y;
        console.log('image ratio', this.ratio);
    }

    setSize(width:number, height:number, margin:number) {
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
    }
}