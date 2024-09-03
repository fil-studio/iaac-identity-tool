import { MathUtils } from "@fils/math";

export interface VideoControlsListener {
    onVideoScrub();
}

export interface TrimInterface {
    progress:HTMLEmbedElement;
    bar:HTMLElement;
    left:HTMLElement;
    right:HTMLElement;

    rect:DOMRect;

    values: {
        start:number;
        end:number;
        p1:number;
        p2:number;
    }
}

export class VideoControls {
    dom:HTMLElement;
    protected videoElement:HTMLVideoElement;
    playBtn:HTMLElement;
    progressKnot:HTMLElement;

    progressBase:HTMLElement;
    progressBar:HTMLElement;
    progressRect:DOMRect;

    trim:TrimInterface;

    time:HTMLElement;
    duration:HTMLElement;

    protected dragging:boolean = false;

    listeners:VideoControlsListener[] = [];

    constructor() {
        this.dom = document.querySelector('div.video');
        this.playBtn = this.dom.querySelector('button');
        this.progressKnot = this.dom.querySelector('button.progress-knot');
        
        this.progressBase = this.dom.querySelector('div.progress');
        this.progressBar = this.dom.querySelector('div.current');

        const t = this.dom.querySelector('div.time');
        this.time = t.querySelector('.current');
        this.duration = t.querySelector('.total');

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

        // trim interface
        const tl = this.dom.querySelector('div.timeline');
        this.trim = {
            rect: null,
            progress: tl.querySelector('div.progress'),
            bar: tl.querySelector('div.trim-bar'),
            left: tl.querySelector('div.left'),
            right: tl.querySelector('div.right'),
            values: {
                start: 0,
                end: 0,
                p1: 0,
                p2: 1
            }
        }
        const v = this.trim.values;

        const l = this.trim.left;
        const r = this.trim.right;
        const d = .05;

        const updateTrim = () => {
            v.start = this.videoElement.duration * v.p1;
            v.end = this.videoElement.duration * v.p2;
            this.trim.bar.style.left = `${v.p1*100}%`;
            this.trim.bar.style.right = `${100-v.p2*100}%`;
            this.trim.left.style.left = `${v.p1*99}%`;
            this.trim.right.style.left = `${v.p2*99}%`;
        }

        const adjustTrimEnd = (x:number, target:HTMLElement) => {
            const rect = this.trim.rect;
            let p = MathUtils.smoothstep(rect.x, rect.x + rect.width, x);
            if(target === l) {
                p = Math.min(p, v.p2 - d);
                v.p1 = p;
            } else {
                p = Math.max(p, v.p1 + d);
                v.p2 = p;
            }

            // console.log(p, x, rect.x, rect.width);

            updateTrim();
        }

        l.addEventListener('mousedown', e => {
            l.classList.add('grabbing');
        });

        r.addEventListener('mousedown', e => {
            r.classList.add('grabbing');
        });

        function stopDrag() {
            l.classList.remove('grabbing');
            r.classList.remove('grabbing');
        }

        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('mouseleave', stopDrag);

        window.addEventListener('mousemove', e => {
            if(l.classList.contains('grabbing')) adjustTrimEnd(e.clientX, l);
            else if(r.classList.contains('grabbing')) adjustTrimEnd(e.clientX, r);
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
            this.time.textContent = this.getTimeString(this.videoElement.currentTime);
            this.duration.textContent = this.getTimeString(this.videoElement.duration);
            this.resetTrimValues();
        }
    }

    protected updatePlayButton() {
        if(!this.videoElement) return;
        if(this.videoElement.paused) this.playBtn.classList.remove('playing');
        else this.playBtn.classList.add('playing');
    }

    resetTrimValues() {
        this.trim.values.start = 0;
        this.trim.values.end = this.videoElement.duration;
        this.trim.values.p1 = 0;
        this.trim.values.p2 = 1;
        this.trim.bar.style.left = '0%';
        this.trim.bar.style.right = '0%';
        this.trim.left.style.left = '0%';
        this.trim.right.style.left = '99%';
        this.trim.left.classList.remove('grabbing');
        this.trim.right.classList.remove('grabbing');
        this.trim.rect = this.trim.progress.getBoundingClientRect();
    }

    getTimeString(value:number):string {
        // const h = Math.floor(value / 3600);
        const min = Math.floor(value / 60);
        const sec = Math.floor(value - min*60);
        const millis = Math.round((value - sec) * 1000);

        const m = min < 10 ? `0${min}` : `${min}`;
        const s = sec < 10 ? `0${sec}` : `${sec}`;

        const mil = millis < 100 ? millis < 10 ? `00${millis}` : `0${millis}` : `${millis}`;

        return `${m}:${s}:${mil}`;
    }

    updateVideoProgress() {
        if(!this.videoElement) return;
        const v = this.trim.values;
        if(this.videoElement.currentTime < v.start -.1 || this.videoElement.currentTime > v.end) {
            this.videoElement.currentTime = v.start;
        }
        const p = this.videoElement.currentTime / this.videoElement.duration;
        this.progressBar.style.width = `${p*100}%`;
        this.time.textContent = this.getTimeString(this.videoElement.currentTime);
    }
}