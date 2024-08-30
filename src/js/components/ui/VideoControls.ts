export class VideoControls {
    dom:HTMLElement;
    protected videoElement:HTMLVideoElement;
    playBtn:HTMLElement;
    progressKnot:HTMLElement;

    progressBar:HTMLElement;

    trimStart:HTMLElement;
    trimEnd:HTMLElement;

    constructor() {
        this.dom = document.querySelector('div.video');
        this.playBtn = this.dom.querySelector('button');
        this.progressKnot = this.dom.querySelector('button.progress-knot');
        this.progressBar = this.dom.querySelector('div.current');

        this.trimStart = this.dom.querySelector('[for="trim_start"]');
        this.trimEnd = this.dom.querySelector('[for="trim_end"]');

        this.playBtn.onclick = () => {
            if(!this.videoElement) return;
            if(this.videoElement.paused) this.videoElement.play();
            else this.videoElement.pause();
            this.updatePlayButton();
        }
    }

    set video(value:HTMLVideoElement) {
        if(value === null) {
            this.dom.classList.remove('active');
            this.videoElement = null;
        } else {
            this.videoElement = value;
            this.dom.classList.add('active');
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