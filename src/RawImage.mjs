/**
 * Object holding an image
 */
export class RawImage {
  width = null;
  height = null;

  /**
   * Constructor
   * @param {Uint8Array} pixels - The image data
   * @param {number} width - The image width
   * @param {number} height - The image height
   * @param {number} bandcount - The number of bands in the image (default = 3)
   */
  constructor(pixels, width, height, bandcount = 3) {
    if (!pixels || !width || !height) {
      throw Error('RawImage constructor expects pixels, width, and height as arguments.');
    }
    this.pixels = pixels;
    this.width = width;
    this.height = height;
    this.bandcount = bandcount;
  }

  /**
   * Add alpha channel
   */
  insertAlphaChannel() {
    // Insert an alpha channel into the image data
    if (this.bandcount == 4) {
      return; // Image already has an alpha channel
    } else if (this.bandcount != 3 && this.bandcount != 1) {
      throw new Error('Image has ' + this.bandcount + ' bands. Only 1-band and 3-band images are supported.');
    }

    let rgba;
    if (this.bandcount === 3) {
      // For 3-band (RGB) images
      rgba = new Uint8Array(this.width * this.height * 4);
      for (let i = 0; i < this.pixels.length; i += 3) {
        const j = (i * 4) / 3;
        rgba[j + 0] = this.pixels[i + 0];
        rgba[j + 1] = this.pixels[i + 1];
        rgba[j + 2] = this.pixels[i + 2];
        rgba[j + 3] = 255; // Alpha channel
      }
    } else if (this.bandcount === 1) {
      // For 1-band (grayscale) images
      rgba = new Uint8Array(this.width * this.height * 4);
      for (let i = 0; i < this.pixels.length; i++) {
        const j = i * 4;
        rgba[j + 0] = this.pixels[i]; // Red
        rgba[j + 1] = this.pixels[i]; // Green
        rgba[j + 2] = this.pixels[i]; // Blue
        rgba[j + 3] = 255; // Alpha channel
      }
    }

    this.pixels = rgba;
    this.bandcount = 4;
  }

  /**
   * Display on Canvas
   */
  displayOnCanvas(canvas, dx = 0, dy = 0) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(this.width, this.height);
    this.insertAlphaChannel();
    imageData.data.set(this.pixels);
    ctx.putImageData(imageData, dx, dy);
  }
}
