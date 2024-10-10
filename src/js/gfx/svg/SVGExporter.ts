import { RTUtils } from "@fils/gfx";
import { Color, WebGLRenderer, WebGLRenderTarget } from "three";
import { Pattern, PatternCards } from "../../components/ui/menu/PatternCards";
import { saveBlob } from "../../core/EsportUtils";
import { SCOPE } from "../../core/Globals";
import { MAT } from "../RenderEngine";
import { Visual } from "../Visual";

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
        svg.setAttribute('version', '1.1');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
        
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
        let sy = 1;

        for(let i=0; i<4; i++) {
            const p = patterns.patterns[i];
            const _svg = panel.svgContents[p.index].cloneNode(true) as SVGElement;
            const sym = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
            sym.setAttribute('id', `sym${sy}`);
            sym.setAttribute('viewBox', _svg.getAttribute('viewBox'));
            sym.setAttribute('width', _svg.getAttribute('width'));
            sym.setAttribute('height', _svg.getAttribute('height'));

            let found = false;

            const t = tiles[i];
            tmp.copy(t.color).convertSRGBToLinear();

            const symW = parseInt(_svg.getAttribute('width'));
            const symH = parseInt(_svg.getAttribute('height'));

            for(const c of _svg.children) {
                if(c.nodeName === 'metadata') continue
                this.fixColors(c, p, `#${tmp.getHexString()}`);
                sym.appendChild(c);
                found = true;
            }

            if(found) {
                svg.appendChild(sym);
            }

            const _svg2 = panel.svgContents[p.index].cloneNode(true) as SVGElement;
            
            svgData.push({
                width: symW,
                height: symH,
                src: _svg2.outerHTML,
                index: sy,
                hasSym: found
            })
            sy++;
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

                    let sym = svgData[j].src as string;

                    svg.appendChild(rect);
                    
                    const symSVG = parser.parseFromString(sym as string, "image/svg+xml").querySelector('svg');
                    if(svgData[j].hasSym) {
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
                            // console.log(c)
                            this.fixColors(c, pattern, `#${tmp.getHexString()}`);
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

    protected fixColors(node:Element, pattern:Pattern, hex:string) {
        const fill = node.getAttribute('fill');
        const stroke = node.getAttribute('stroke');
        if(fill && fill != 'none') {
            node.setAttribute('fill', this.getColorHex(pattern, fill, hex));
        } else {
            // it was black
            node.setAttribute('fill', pattern.inverted ? '#ffffff' : hex);
        }
        if(stroke && stroke !== 'none') {
            node.setAttribute('stroke', this.getColorHex(pattern, stroke, hex));
        }
    }

    protected getColorHex(pattern:Pattern, input:string, hex:string):string {
        const tmp = new Color().setStyle(input);
        if(pattern.inverted) {
            // turn black into white and white into hex
            if(tmp.r === 0 && tmp.g === 0 && tmp.b === 0) {
                return "#ffffff";
            } else if(tmp.r === 1 && tmp.g === 1 && tmp.b === 1) {
                return hex;
            }
        } else {
            // turn black into hex and keep white
            if(tmp.r === 0 && tmp.g === 0 && tmp.b === 0) {
                return hex;
            }
        }

        return input;
    }
}

export const SVGExporter = new _SVGExporter();