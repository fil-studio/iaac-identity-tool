in vec2 vUv;

uniform vec2 resolution;

struct Settings {
    float tiles;
};

uniform Settings settings;

uniform sampler2D tInput;

uniform int mode;

float rgb2lum(vec3 p) {
    return 0.3086 * p.r + 0.6094 * p.g + 0.0820 * p.b;
}

void main() {
    // pixelate uv
    float ratio = resolution.x / resolution.y;
    float gridSize = resolution.x / settings.tiles;
    vec2 uvStep = vec2(gridSize / resolution.x, gridSize / resolution.y); 

    vec4 color = texture2D(tInput, vUv);

    vec2 uv = floor(vUv / uvStep) * uvStep;// + uvStep * 0.5;
    vec4 newTexturePixelated = textureLod(tInput, uv, 4.0);

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
    }
}