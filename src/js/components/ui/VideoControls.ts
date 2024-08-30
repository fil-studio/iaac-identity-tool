import { MathUtils } from "@fils/math";

export interface VideoControlsListener {
    onVideoScrub();
}

export class VideoControls {
    dom:HTMLElement;
    protected videoElement:HTMLVideoElement;
    playBtn:HTMLElement;
    progressKnot:HTMLElement;

    progressBase:HTMLElement;
    progressBar:HTMLElement;
    progressRect:DOMRect;

    trimStart:HTMLElement;
    trimEnd:HTMLElement;

    protected dragging:boolean = false;

    listeners:VideoControlsListener[] = [];

    constructor() {
        this.dom = document.querySelector('div.video');
        this.playBtn = this.dom.querySelector('button');
        this.progressKnot = this.dom.querySelector('button.progress-knot');
        
        this.progressBase = this.dom.querySelector('div.progress');
        this.progressBar = this.dom.querySelector('div.current');

        this.trimStart = this.dom.querySelector('[for="trim_start"]');
        this.trimEnd = this.dom.querySelector('[for="trim_end"]');

        this.playBtn.onclick = () => {
            if(!this.videoElement) return;
            if(this.videoElement.paused) this.videoElement.play();
            else this.videoElement.pause();
            this.updatePlayButton();
        }

        this.progressKnot.onmousedown = () => {
            this.startDrag();
        }

        const stopD = () => {
            this.stopDrag();
        }

        window.addEventListener('mouseup', stopD);
        window.addEventListener('mouseleave', stopD);
        window.addEventListener('mousemove', e => {
            this.drag(e.clientX);
        });
    }

    addListener(lis:VideoControlsListener) {
        if(this.listeners.indexOf(lis) > -1) return;
        this.listeners.push(lis);
    }

    removeListener(lis:VideoControlsListener) {
        this.listeners.splice(this.listeners.indexOf(lis), 1);
    }

    startDrag() {
        if(!this.videoElement) return;
        if(this.dragging) return;
        this.dragging = true;
        this.videoElement.pause();
        this.updatePlayButton();
    }

    stopDrag() {
        if(!this.dragging) return;
        this.dragging = false;
    }

    drag(x:number) {
        if(!this.videoElement) return;
        if(!this.dragging) return;
        const p = MathUtils.smoothstep(this.progressRect.x, this.progressRect.x + this.progressRect.width, x);

        const t = this.videoElement.currentTime;

        this.progressBar.style.width = `${p*100}%`;
        this.videoElement.currentTime = this.videoElement.duration * p;

        if(this.videoElement.currentTime !== t) {
            for(const lis of this.listeners) {
                lis.onVideoScrub();
            }
        }
    }

    set video(value:HTMLVideoElement) {
        if(value === null) {
            this.dom.classList.remove('active');
            this.stopDrag();
            this.videoElement = null;
        } else {
            this.videoElement = value;
            this.dom.classList.add('active');
            this.progressRect = this.progressBase.getBoundingClientRect();
            this.updatePlayButton();
            this.resetTrimValues();
        }
    }

    protected updatePlayButton() {
        if(!this.videoElement) return;
        if(this.videoElement.paused) this.playBtn.classList.remove('playing');
        else this.playBtn.classList.add('playing');
    }

    resetTrimValues() {
        this.trimStart.querySelector('input').value = '0:00:00';
        this.trimEnd.querySelector('input').value = this.getTimeString(this.videoElement.duration);
    }

    getTimeString(value:number):string {
        const h = Math.floor(value / 3600);
        const min = Math.floor(value / 60);
        const sec = (value - min*60 - h*3600);

        const m = min < 10 ? `0${min}` : `${min}`;
        const s = sec < 10 ? `0${sec}` : `${sec}`;

        return `${h}:${m}:${s}`;
    }

    updateVideoProgress() {
        if(!this.videoElement) return;
        const p = this.videoElement.currentTime / this.videoElement.duration;
        this.progressBar.style.width = `${p*100}%`;
    }
}