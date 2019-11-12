/**
 * Helpers canvas texture mixin.
 *
 * @module helpers/canvas/texture
 */

const canvasTexture = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = three.DataTexture;
  return class extends Constructor {
    constructor(data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding) {
      super(data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding);

      this._canvas = document.createElement("canvas");
      this._canvas.width = width;
      this._canvas.height = height;
      this._context2D = this._canvas.getContext("2d");

      this._xCross = 0;
      this._yCross = 0;
      this._crossRadius = 57;
      this._crossMax = 40;
      this._crossMin = 4;
      this._crossThickness = 4;
      this._parentTexture = [];

      // if (parentTexture) {
      this._background = this.image;

      //   this._parentTexture.push(parentTexture);
      this.image = this._canvas;
      // }

      this._draw();
    }

    // addParent(parentTexture) {
    //   if (this._parentTexture.indexOf(parentTexture) === -1) {
    //     this._parentTexture.push(parentTexture);
    //     parentTexture.image = this._canvas;
    //   }
    // }

    // setCrossPosition(x, y) {
    //   this._xCross = x * this._canvas.width;
    //   this._yCross = y * this._canvas.height;
    //   this._draw();
    // }

    _draw() {
      if (!this._context2D) return;
      this._context2D.clearRect(0, 0, this._canvas.width, this._canvas.height);
      // Background.
      this._context2D.drawImage(this._background, 0, 0);
      // Yellow cross.
      this._context2D.lineWidth = this._crossThickness * 3;
      this._context2D.strokeStyle = "#FFFF00";
      this._context2D.beginPath();
      this._context2D.moveTo(this._xCross - this._crossMax - 2, this._yCross - this._crossMax - 2);
      this._context2D.lineTo(this._xCross - this._crossMin, this._yCross - this._crossMin);
      this._context2D.moveTo(this._xCross + this._crossMin, this._yCross + this._crossMin);
      this._context2D.lineTo(this._xCross + this._crossMax + 2, this._yCross + this._crossMax + 2);
      this._context2D.moveTo(this._xCross - this._crossMax - 2, this._yCross + this._crossMax + 2);
      this._context2D.lineTo(this._xCross - this._crossMin, this._yCross + this._crossMin);
      this._context2D.moveTo(this._xCross + this._crossMin, this._yCross - this._crossMin);
      this._context2D.lineTo(this._xCross + this._crossMax + 2, this._yCross - this._crossMax - 2);
      this._context2D.stroke();
      for (var i = 0; i < this._parentTexture.length; i++) {
        this._parentTexture[i].needsUpdate = true;
      }
    }
  };
};

export {
  canvasTexture
};
export default canvasTexture();