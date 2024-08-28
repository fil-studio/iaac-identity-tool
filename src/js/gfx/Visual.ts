import { Vector2 } from "three";

export interface CropSettings {
    ratio:number;
    width:number;
    height:number;
    offsetX:number;
    offsetY:number;
}

export interface VisualListener {
    onVisualLoaded(vis:VisualSettings);
    onTextureUpdate();
}

export class VisualSettings {
    protected el:HTMLImageElement|HTMLVideoElement;
    crop:CropSettings = {
        ratio: 1,
        width: 540,
        height: 540,
        offsetX: 0,
        offsetY: 0
    }
    originalSize:Vector2 = new Vector2();
    ratio:number = 1;
    protected _isVideo:boolean = false;

    protected listeners:VisualListener[] = [];

    addListener(lis:VisualListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:VisualListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    protected updateResolution(isVideo:boolean=false) {
        if(isVideo) {
            const video = this.el as HTMLVideoElement;
            this.originalSize.set(video.videoWidth, video.videoHeight);
        } else {
            const img = this.el as HTMLImageElement;
            this.originalSize.set(img.width, img.height);
        }

        this.ratio = this.originalSize.x / this.originalSize.y;
        // console.log('image ratio', this.ratio);

        const cs = Math.min(this.originalSize.x, this.originalSize.y);

        //reset crop
        this.crop = {
            ratio: 1,
            width: cs,
            height: cs,
            offsetX: 0,
            offsetY: 0
        };

        if(this.crop.width > this.originalSize.width) {
            this.crop.width = this.originalSize.width;
            this.crop.height = this.originalSize.width;
        }

        if(this.crop.height > this.originalSize.height) {
            this.crop.width = this.originalSize.height;
            this.crop.height = this.originalSize.height;
        }

        for(const lis of this.listeners) {
            lis.onVisualLoaded(this);
        }
    }

    protected loadVideo(url:string) {
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
            this.updateResolution(true);    
        });
        
        video.src = url;
        this.el = video;
    }

    protected loadImage(url:string) {
        const img = new Image();
        img.onload = () => {
            this.updateResolution();
        }
        this.el = img;
        img.src = url;
    }

    updateElement(src:string, isVideo:boolean=false) {
        this._isVideo = isVideo;
        if(isVideo) this.loadVideo(src);
        else this.loadImage(src);
    }

    get video():boolean {
        return this._isVideo;
    }

    get element() {
        return this.el;
    }

    tick() {
        if(this.video) {
            const video = this.el as HTMLVideoElement;
            if(!video.paused) {
                for(const lis of this.listeners) {
                    lis.onTextureUpdate();
                }
            }
        }
    }
}

export const Visual = new VisualSettings();