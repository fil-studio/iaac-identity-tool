import { addFileDropHandler } from "@fils/utils";

export const supportedVideo = ["video/mp4", "video/webm"];
export const supportedImage = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export function getVisualURL(file:File, callback:Function) {
    if(supportedVideo.indexOf(file.type) > -1) {
        // console.log('Supported video type!')
        const url = URL.createObjectURL(file);
        callback(url, true);
    } else if(supportedImage.indexOf(file.type) > -1) {
        // console.log('Supported image type!');
        const url = URL.createObjectURL(file);
        callback(url);
    } else {
        console.warn('File Type not compatible!');
    }
}

export function initDragAndDrop(el:HTMLElement, callback:Function) {
    addFileDropHandler(el, files => {
        const file = files[0];
        getVisualURL(file, callback);
    })
}