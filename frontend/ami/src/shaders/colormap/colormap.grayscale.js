import ShadersBase from '../shaders.base';

class GrayscaleColormap extends ShadersBase {
    constructor() {
        super();
        this.name = 'colormap';

        // default properties names    
        this._value = 'value';
        this._tLower = 'tLower';
        this._tRange = 'tMul';
        this._color = 'color';
    }

    api(baseFragment = this._base, value = this._value, tLower = this._tLower, tMul = this._tMul, color = this._color) {
        this._base = baseFragment;
        return this.compute(value, tLower, tMul, color);
    }

    compute(value, tLower, tMul, color) {
        this.computeDefinition();
        this._base._functions[this._name] = this._definition;
        return `${this._name}(${value}, ${tLower}, ${tMul}, ${color});`;
    }

    computeDefinition() {
        this._definition = `

void ${this._name}(in float value, in float tLower, in float tMul, out vec4 color) {
    float t = (value - tLower) * tMul * 255.0;
    float r = t / 255.0;
    float g = t / 255.0;
    float b = t / 255.0;

    color = vec4(r, g, b, 1.0);
}
    `;
    }
}

export default new GrayscaleColormap();