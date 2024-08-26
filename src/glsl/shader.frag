in vec2 vUv;

uniform vec2 resolution;

struct Tile {
    vec3 color;
    sampler2D map;
    float t0; // lower threshold
    float t1; // upper threshold
};

struct Settings {
    float columns;
    Tile[4] tiles;
};

uniform Settings settings;

uniform sampler2D tInput;

uniform int mode;

uniform float alphaBlend;

float rgb2lum(vec3 p) {
    return 0.3086 * p.r + 0.6094 * p.g + 0.0820 * p.b;
}

void main() {
    // pixelate uv
    float ratio = resolution.x / resolution.y;
    float gridSize = resolution.x / settings.columns;
    vec2 uvStep = vec2(gridSize / resolution.x, gridSize / resolution.y); 

    vec4 color = texture2D(tInput, vUv);

    vec2 uv = floor(vUv / uvStep) * uvStep;// + uvStep * 0.5;
    // vec4 newTexturePixelated = textureLod(tInput, uv, 8.0);
    vec4 newTexturePixelated = texture2D(tInput, uv);

    float lum = rgb2lum(newTexturePixelated.rgb);

    if(mode == 0) {
        // original
        gl_FragColor = color;
    } else if(mode == 1) {
        // pixelated
        gl_FragColor = newTexturePixelated;
    } else if(mode == 2) {
        // luminance threshold
        gl_FragColor = vec4(vec3(lum), newTexturePixelated.a);
    } else if(mode == 3) {
        // comp
        for(int i=0;i<4;i++) {
            if(lum >= settings.tiles[i].t0 && lum < settings.tiles[i].t1) {
                //gotcha
                vec2 tl = 1.0 / uvStep;
                vec2 tUv = mod(vUv * tl, vec2(1.));
                vec4 mCol = texture2D(settings.tiles[i].map, tUv);
                float aR = smoothstep(alphaBlend, 1.0, mCol.a);
                vec3 col = mix(settings.tiles[i].color, mCol.rgb, aR);
                gl_FragColor = vec4(col, 1.0);
            }
        }
    }
}