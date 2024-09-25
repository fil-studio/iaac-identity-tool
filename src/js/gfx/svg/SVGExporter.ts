import { RTUtils } from "@fils/gfx";
import { Color, WebGLRenderer, WebGLRenderTarget } from "three";
import { PatternCards } from "../../components/ui/menu/PatternCards";
import { MAT } from "../RenderEngine";
import { Visual } from "../Visual";
import { saveBlob } from "../../core/EsportUtils";
import { SCOPE } from "../../core/Globals";

class _SVGExporter {
    save(rnd:WebGLRenderer, patterns:PatternCards, scale:number) {
        const m = MAT;
        m.uniforms.mode.value = 1;
        const s = m.uniforms.settings.value;
        const w = s.columns;
        const h = Math.floor(w / Visual.crop.ratio);
        const rt = new WebGLRenderTarget(w, h);
        RTUtils.renderToRT(rt, rnd, m);
        const buffer = new Uint8Array(w*h*4);
        // console.log(w,h);
        rnd.readRenderTargetPixels(rt, 0, 0, w, h, buffer);
        // console.log(buffer);
        const svg = this.createSVG(buffer, patterns, scale);
        saveBlob(new Blob([svg.outerHTML], {type: 'image/svg+xml'}), `download-${Date.now()}.svg`)
        rt.dispose();
        m.uniforms.mode.value = 3;
    }

    protected createSVG(pixels:Uint8Array, patterns:PatternCards, scale:number):SVGElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const crop = Visual.crop;
        const s = MAT.uniforms.settings.value;
        const tiles = s.tiles;
        const tmp = new Color();
        const width = crop.width * scale;
        const height = crop.height * scale;
        svg.setAttribute('width', `${width}`);
        svg.setAttribute('height', `${height}`);

        const tw = scale * crop.width / s.columns;
        let x = 0, y = height-tw;
        let k = 0;

        const panel = SCOPE.patternsPanel;

        const svgData = [];

        for(const p of patterns.patterns) {
            const svg = panel.svgContents[p.index];
            
            svgData.push({
                width: parseInt(svg.getAttribute('width')),
                height: parseInt(svg.getAttribute('height')),
                src: svg.outerHTML
            })
        }

        // console.log(svgData);
        var parser = new DOMParser();

        for(let i=0; i<pixels.length; i++) {
            const v = pixels[i*4] / 255;
            for(let j=0;j<4;j++) {
                const t = tiles[j];
                const pattern = patterns.patterns[j];
                if(v >= t.t0 && v <= t.t1) {
                    //gotcha
                    tmp.copy(t.color).convertSRGBToLinear();
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute('width', `${tw}`);
                    rect.setAttribute('height', `${tw}`);
                    rect.setAttribute('x', `${x}`);
                    rect.setAttribute('y', `${y}`);

                    //background;
                    const color = pattern.inverted ? tmp.getHexString() : "FFFFFF";
                    rect.setAttribute('fill', `#${color}`);

                    let sym = svgData[j].src.toLowerCase() as string;
                    if(!pattern.inverted) {
                        //@ts-ignore
                        sym = sym.replaceAll('000000', tmp.getHexString())
                        //@ts-ignore
                        sym = sym.replaceAll('black', tmp.getHexString())
                    } else {
                        //@ts-ignore
                        sym = sym.replaceAll('ffffff', tmp.getHexString())
                        //@ts-ignore
                        sym = sym.replaceAll('black', tmp.getHexString())
                    }

                    svg.appendChild(rect);
                    
                    const symSVG = parser.parseFromString(sym as string, "image/svg+xml").querySelector('svg');
                    if(symSVG.children.length) {
                        // console.log(symSVG);

                        const scaleX = Math.abs(tw / svgData[j].width);
                        const scaleY = Math.abs(tw / svgData[j].height);
                        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        g.setAttribute('transform', `
                            translate(${x} ${y})
                            scale(${scaleX} ${scaleY})
                        `)
                        for(const c of symSVG.children) {
                            if(c.nodeName === 'metadata') continue;
                            console.log(c)
                            g.appendChild(c);
                        }
                        svg.appendChild(g);
                    }
                    
                    k++;
                    if(k === s.columns) {
                        k = 0;
                        x = 0;
                        y -= tw;
                    } else {
                        x += tw;
                    }
                }
            }
        }

        return svg;
    }
}

export const SVGExporter = new _SVGExporter();