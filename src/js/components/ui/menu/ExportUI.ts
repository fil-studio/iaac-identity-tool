import { saveBlob } from "../../../core/EsportUtils";
import { SCOPE } from "../../../core/Globals";
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

        const saveImage = () => {
            const canvas = SCOPE.view.gl.domElement;
            canvas.toBlob(blob => {
                const filename = `download-${Date.now()}.png`;
                saveBlob(blob, filename);
                this.restoreCanvas();
                this.hide();
            }, "png");
        }

        const realSave = () => {
            const canvas = SCOPE.view.gl.domElement;

            if(this.video) {
                const stream = canvas.captureStream(30);
                const recordedChunks = [];

                // Create MediaRecorder with canvas stream
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

                this.cards[0].classList.remove('active');
                this.cards[1].classList.add('active');
                const progress = this.cards[1].querySelector('div.current') as HTMLElement;

                const animate = () => {
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
        sel.options[0].hidden = video;
        sel.options[1].hidden = video;
        sel.options[2].hidden = !video;
        sel.options[3].hidden = !video;
        
        sel.options[0].selected = !video;
        sel.options[1].selected = false;
        sel.options[2].selected = video;
        sel.options[3].selected = false;
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
        } else if(Visual.video) {
            const v = Visual.element as HTMLVideoElement;
            v.pause();
        }
    }
}