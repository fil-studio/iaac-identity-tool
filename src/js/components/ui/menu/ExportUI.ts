import { encodeMP4, saveBlob } from "../../../core/EsportUtils";
import { IS_DESKTOP_APP, SCOPE } from "../../../core/Globals";
import { Visual } from "../../../gfx/Visual";
import { HiddeableComponent } from "../../core/Component";

const MAX = 4096 * 4096;

export class ExportUI extends HiddeableComponent {
    video:boolean = false;
    protected videoWasPlaying:boolean = false

    cards:HTMLDivElement[] = [];

    constructor(_dom:HTMLElement) {
        super(_dom);

        const m = _dom.querySelectorAll('div.modal-body');
        for (const c of m) {
            this.cards.push(c as HTMLDivElement);
        }

        const cancel = () => {
            if(this._active) this.hide();
        }

        const sel = this.dom.querySelector("select#fileFormat") as HTMLSelectElement;
        sel.onchange = () => {
            this.toggleQuality();
        }

        const saveImage = () => {
            const canvas = SCOPE.view.gl.domElement;
            canvas.toBlob(blob => {
                const filename = `download-${Date.now()}.png`;
                saveBlob(blob, filename);
                this.restoreCanvas();
                this.hide();
            }, "png");
        }

        const uiVideoExport = () => {
            this.cards[0].classList.remove('active');
            this.cards[1].classList.add('active');
            const progress = this.cards[1].querySelector('div.current') as HTMLElement;
            progress.style.width = '0%';
        }

        const webMexport = () => {
            const canvas = SCOPE.view.gl.domElement;
            const stream = canvas.captureStream(30);
            const recordedChunks = [];

            // Create MediaRecorder with canvas stream
            // const options = { mimeType: "video/webm; codecs=vp8" };
            const mediaRecorder = new MediaRecorder(stream);

            // On data available, push data chunks to array
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                recordedChunks.push(event.data);
              }
            };

            // Create a video Blob from recorded chunks and generate a download link
            mediaRecorder.onstop = () => {
              const blob = new Blob(recordedChunks, { type: 'video/webm' });
              const filename = `download-${Date.now()}.webm`;
              saveBlob(blob, filename);
              this.restoreCanvas();
              this.hide();
            };

            const v = Visual.element as HTMLVideoElement;
            v.loop = false;
            const trim = SCOPE.videoControls.trim.values;
            v.currentTime = trim.start;

            uiVideoExport();
            const progress = this.cards[1].querySelector('div.current') as HTMLElement;

            let cancel = false;

            const btn = this.cards[1].querySelector('button');
            btn.onclick = () => {
                cancel = true;
                this.hide();
            };

            const animate = () => {
                if(cancel) return;
                if(v.currentTime >= trim.end) {
                    v.pause();
                    v.loop = true;
                    mediaRecorder.stop();
                    return;
                }
                const p = (v.currentTime - trim.start) / (trim.end - trim.start);
                progress.style.width = `${p*100}%`;
                SCOPE.view.crop.render();
                requestAnimationFrame(animate);
            }

            requestAnimationFrame(animate);

            v.play();
            // Start recording
            mediaRecorder.start();
        }

        const exportMP4 = () => {
            const canvas = SCOPE.view.gl.domElement;
            const v = Visual.element as HTMLVideoElement;
            v.loop = false;

            const trim = SCOPE.videoControls.trim.values;
            let current = 0
            const len = trim.end - trim.start;
            const nFrames = Math.round(len * 30);

            uiVideoExport();
            const progress = this.cards[1].querySelector('div.current') as HTMLElement;

            const exporter= window['Exporter'];
            exporter.initVideoRecording();

            const q = this.dom.querySelector('.jsQuality').querySelector('select');

            let exporting = false;

            v.onseeked = () => {
                if(exporting) return;
                if(current === nFrames) {
                    exporting = true;
                    // console.log('done');
                    exporter.encodeVideo({
                        fps: 30,
                        quality: q.value
                    }, (prog:number) => {
                        progress.style.width = `${70 + 30*prog}%`;
                    }, () => {
                        this.restoreCanvas();
                        this.hide();
                    })
                    return;
                }

                SCOPE.view.crop.render();
                console.log('seeked');
                progress.style.width = `${(current/nFrames)*70}%`;

                canvas.toBlob(blob => {
                    exporter.saveVideoStill(blob, () => {
                        current++;
                        v.currentTime = trim.start + len * (current/nFrames);
                    })
                }, "png");
            }

            v.currentTime = trim.start;
        }

        const realSave = () => {
            if(this.video) {
                if(sel.value === 'webm') {
                    webMexport();
                } else {
                    exportMP4();
                }
            } else {
                saveImage();
            }
        }

        const save = () => {
            // if(this._active) this.hide();
            const canvas = SCOPE.view.gl.domElement;
            this.configCanvasForExport();
            SCOPE.view.render();
            if(canvas.width * canvas.height > MAX) {
                if(window.confirm('Max canvas size exceeded. File might not export correctly. Try anyway?')) {
                    realSave();
                }
            } else {
                realSave();
            }
            
        }

        const btns = _dom.querySelectorAll('button');

        const cancelBtn = btns[0];
        const exportBtn = btns[1];

        cancelBtn.onclick = cancel;
        exportBtn.onclick = save;
    }

    protected configCanvasForExport() {
        const el = this.dom.querySelector('select#exportSize') as HTMLSelectElement;
        const scale = parseFloat(el.value);
        const w = Math.round(Visual.crop.width * scale);
        const h = Math.round(Visual.crop.height * scale);

        console.log('setting export scale to', scale);

        SCOPE.view.setSize(w, h);
        SCOPE.engine.updateResolution(w, h);
    }

    protected restoreCanvas() {
        const el = this.dom.querySelector('select#exportSize') as HTMLSelectElement;
        const w = Visual.crop.width;
        const h = Visual.crop.height;

        SCOPE.view.setSize(w, h);
        SCOPE.engine.updateResolution(w, h);

        SCOPE.view.render();
    }

    updateUI(video:boolean) {
        const sel = this.dom.querySelector("select#fileFormat") as HTMLSelectElement;
        sel.options[0].hidden = true;//video;
        sel.options[1].hidden = video;
        sel.options[2].hidden = !video;
        sel.options[3].hidden = !(video && IS_DESKTOP_APP);
        
        sel.options[0].selected = false;
        sel.options[1].selected = !video;
        if(IS_DESKTOP_APP) {
            sel.options[2].selected = false;
            sel.options[3].selected = video;
        } else {
            sel.options[2].selected = video;
            sel.options[3].selected = false;
        }

        this.toggleQuality();
    }

    show(isVideo:boolean=false) {
        this.active = true;
        this.video = isVideo;

        this.cards[0].classList.add('active');
        this.cards[1].classList.remove('active');

        this.updateUI(isVideo);

        if(Visual.video) {
            const v = Visual.element as HTMLVideoElement;
            this.videoWasPlaying = !v.paused;
            v.pause();
        } else {
            this.videoWasPlaying = false;
        }

        const a = this.dom.querySelector('div.alert');
        a.textContent = `Canvas size: ${Visual.crop.width}x${Visual.crop.height}`
        SCOPE.exporting = true;
    }

    hide() {
        this.active = false;
        SCOPE.exporting = false;
        if(this.videoWasPlaying) {
            const v = Visual.element as HTMLVideoElement;
            v.play();
            this.videoWasPlaying = false;
            v.loop = true;
        } else if(Visual.video) {
            const v = Visual.element as HTMLVideoElement;
            v.pause();
            v.loop = true;
        }
    }

    toggleQuality() {
        const q = this.dom.querySelector('.jsQuality');
        const sel = this.dom.querySelector("select#fileFormat") as HTMLSelectElement;
        if(Visual.video && sel.value === "mp4") {
            q.classList.add('active');
        } else {
            q.classList.remove('active');
        }
    }
}