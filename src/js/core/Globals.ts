import { PatternPanel } from "../components/panels/PatternPanel";
import { PatternCards } from "../components/ui/menu/PatternCards";
import { VideoControls } from "../components/ui/VideoControls";
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
    videoControls:VideoControls;
    patterns:PatternCards;
    patternsPanel:PatternPanel;
}

export const SCOPE:ScopeInterface = {
    engine: null,
    view: null,
    exporting: false,
    videoControls: null,
    patterns: null,
    patternsPanel: null
}