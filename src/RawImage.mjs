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
    
    // If pixels is an arraybuffer, convert it to an Uint8Array
    if (pixels instanceof ArrayBuffer) {
      pixels = new Uint8Array(pixels);
    }

    this.pixels = pixels;
    this.width = width;
    this.height = height;
    this.bandcount = bandcount;
  }

  static must_be(object, fourcc = null) {
    if (!(object instanceof RawImage)) {
      throw Error('rawImage must be an instance of RawImage');
    }

    if (fourcc && object.fourcc !== fourcc) {
      throw Error('Expected a RawImage with fourcc=' + fourcc + ' but got ' + object.fourcc + ' instead.');
    }
  }


  static displayOnCanvas(rawImage, canvas, dx = 0, dy = 0) {
    RawImage.must_be(rawImage);
    const width = rawImage.width;   // Number
    const height = rawImage.height; // Number
    const pixels = rawImage.pixels; // Uint8Array
    const bandcount = rawImage.bandcount; // Number (default = 3)
  
    // Get canvas context
    const ctx = canvas.getContext('2d');
    // canvas.width = width;  // DO NOT SET DIMENSIONS HERE!!
    // canvas.height = height;// This prevents displaying a tile.
  
    // Create an ImageData object
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data; // Uint8ClampedArray for the canvas
  
    // Copy raw pixel data into the ImageData buffer
    for (let i = 0, j = 0; i < pixels.length; i += bandcount, j += 4) {
      data[j] = pixels[i];     // R
      data[j + 1] = pixels[i + 1]; // G
      data[j + 2] = pixels[i + 2]; // B
      data[j + 3] = bandcount === 4 ? pixels[i + 3] : 255; // A (fully opaque if no alpha)
    }
  
    ctx.putImageData(imageData, dx, dy);
  }
}

export default RawImage;
