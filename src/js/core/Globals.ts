import { ExportView } from "../gfx/ExportView";
import { RenderEngine } from "../gfx/RenderEngine";

//@ts-ignore
export const IS_DEV_MODE = DEV_MODE;

//@ts-ignore
export const IS_DESKTOP_APP = window.process !== undefined;

export interface ScopeInterface {
    engine:RenderEngine;
    view:ExportView;
    exporting:boolean;
}

export const SCOPE:ScopeInterface = {
    engine: null,
    view: null,
    exporting: false
}