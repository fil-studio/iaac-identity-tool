const fs = require('fs');
const TMP = __dirname + "/../tmp/";

const Exporter = {
    outputPath: "",

    videoExport: {
        id: null,
        rendering: false,
        count: 0
    },

    clean() {
        console.log('cleaning temp folder...');
        try{fs.rmSync(TMP, {recursive: true});}
        catch(e) {
            console.warn("Error removing output tmp folder. Not Found.");
        }

        console.log('creating empty temp folder...');
        try { fs.mkdirSync(TMP, {recursive: true}); }
        catch(e) {
            console.warn("Error creating internal output tmp folder");
            console.warn(e);
        }
    },

    saveBlob (blob, filename, callback) {
        const reader = new FileReader();
        const opath = this.getPath(filename);
        reader.onloadend = () => {
            // fs.writeFileSync(opath, Buffer.from(reader.result));
            fs.writeFile(opath, new Uint8Array(reader.result), err => {
                if (err) {
                  alert("An error ocurred creating the file " + err.message);
                //   state.rendering = false;
                } else {
                    this.showFile(opath);
                    callback();
                }
              });
        }

        reader.readAsArrayBuffer(blob);
    },

    showFile(filename) {
        const { shell } = require('@electron/remote');
        shell.showItemInFolder( filename );
    },

    initVideoRecording() {
        const state = this.videoExport;
        const id = `--video--${Date.now()}`;
        state.id = id;
        try { fs.mkdirSync(`${TMP}${id}/`, {recursive: true}); }
        catch(e) {
            console.warn("Error creating internal output video folder");
            console.warn(e);
            return;
        }
        state.count = 0;
        state.rendering = true;
    },

    saveVideoStill(blob, callback) {
        const state = this.videoExport;
        if(!state.rendering) {
            console.warn('No video recording started!');
        }

        let f = `${++state.count}`;
        while(f.length < 6) f = `0${f}`;

        let filename = `${TMP}/${state.id}/${f}.png`;

        const reader = new FileReader();

        reader.onloadend = () => {
            fs.writeFile(filename, new Uint8Array(reader.result), err => {
                if (err) {
                  alert("An error ocurred creating the file " + err.message);
                  state.rendering = false;
                } else {
                    callback();
                }
              });
        }

        reader.readAsArrayBuffer(blob);
    },

    encodeVideo (settings, onProgress, onEnd, onError) {
        const ffmpeg = require('./ffmpeg');
        const state = this.videoExport;

        var opath = this.getPath(`video-${Date.now()}.mp4`);
        const job = ffmpeg({
            source: `${TMP}${state.id}/%06d.png`
        }).FPSInput(settings.fps).withFPS(settings.fps).on( 'end', () => {
            console.log('video encoded succesfully');
            state.rendering = false;

            this.showFile(opath);

            onEnd();
        }).on('error', (err, stdout, stderr) => {
            state.rendering = false;
            onError(err.message);
        }).on('progress', (progress)=>{
            // console.log(progress.percent);
            onProgress(progress.percent/100);
        });

        job.format('mp4').videoCodec('libx264');
        job.addOption('-pix_fmt', 'yuv420p');
        // job.addOption('-maxrate', '100M');
        // job.addOption('-minrate', '100M');
        
        if(settings.quality === 'low') {
            job.addOption('-b:v', '2M');
        } else if(settings.quality === 'medium') {
            job.addOption('-b:v', '10M');
        } else {
            job.addOption('-b:v', '500M');
        }
        
        // job.addOption('-x264opts', 'colormatrix=bt709');
        // job.addOption('-color_trc', 'iec61966-2-1');
        job.addOption('-color_primaries', 'bt2020');
        // job.addOption('-crf', '1');
        // job.addOption('-preset', 'veryslow')

        /* if(settings.format === 0) {
            job.format('mov');
            job.addOption('-c:v', 'prores');
        } else {
            job.format('webp');
            job.addOption('-c:v', 'libwebp_anim');
        } */


        try {job.outputOptions('-strict -2').noAudio().save(opath);}
        catch(e) {
            state.rendering = false;
            onError(e);
        }
    },

    getPath(filename) {
        const os = require('os');
        if(os.platform() === "win32") {
            return `${this.outputPath}\\${filename}`;
        }

        return `${this.outputPath}/${filename}`;
    }
}

module.exports = {
    Exporter
}