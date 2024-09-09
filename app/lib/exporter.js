const fs = require('fs');

const Exporter = {
    outputPath: "",

    saveBlob (blob, filename, callback) {
        const reader = new FileReader();
        const opath = `${this.outputPath}/${filename}`;
        reader.onloadend = () => {
            // fs.writeFileSync(opath, Buffer.from(reader.result));
            fs.writeFile(opath, new Uint8Array(reader.result), err => {
                if (err) {
                  alert("An error ocurred creating the file " + err.message);
                //   state.rendering = false;
                } else {
                    const { shell } = require('@electron/remote');
                    shell.showItemInFolder( opath );
                    callback();
                }
              });
        }

        reader.readAsArrayBuffer(blob);
    },

    showFile(filename) {
        const opath = `${this.outputPath}/${filename}`;
        const { shell } = require('electron');
        shell.showItemInFolder( opath );
    }
}

module.exports = {
    Exporter
}