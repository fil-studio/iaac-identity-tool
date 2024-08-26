import vertexShader from "../../glsl/shader.vert";
import fragmentShader from "../../glsl/shader.frag";
import { Mesh, PlaneGeometry, ShaderMaterial, TextureLoader, Vector2 } from "three";
import { RTUtils } from "@fils/gfx";

export const MAT = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        resolution: {
            value: new Vector2()
        },
        settings: {
            value: {
                tiles: 30
            }
        },
        tInput: {
            value: null
        },
        mode: {
            value: 2
        }
    }
});

const tLaoder = new TextureLoader();

const geo = new PlaneGeometry(1,1);

export class RenderEngine {
    ratio:number;
    quad:Mesh;

    constructor() {
        this.loadTestImage('assets/test/test-image.jpg');

        this.quad = new Mesh(geo, MAT);
    }

    protected loadTestImage(url:string) {
        tLaoder.load(url, texture => {
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