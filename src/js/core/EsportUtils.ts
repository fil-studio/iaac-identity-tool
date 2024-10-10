import { IS_DESKTOP_APP } from "./Globals";

export function downloadBlob(blob:Blob, filename:string) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.visibility = "hidden";
    const url = window.URL.createObjectURL(blob);
    a.href = url;

    // console.log(filename)
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    document.body.removeChild(a);
}

export function saveBlob(blob:Blob, filename:string) {
    if(!IS_DESKTOP_APP) {
        downloadBlob(blob, filename);
    } else {
        const exporter = window['Exporter'];
        exporter.saveBlob(blob, filename, () => {
            console.log('done');
        });
    }
}

export function encodeMP4(blob:Blob, filename:string) {
    if(!IS_DESKTOP_APP) {
        console.warn(`This feature isn't available on web mode!`)
        return;
    }
    const exporter = window['Exporter'];
    exporter.encodeMP4(blob, filename);
}