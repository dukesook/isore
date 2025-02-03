import RawImage from './RawImage.mjs';

export class ImageSequence {
  images = [];
  fps = null;

  addImage(image) {
    RawImage.must_be(image);
    this.images.push(image);
  }
}

export default ImageSequence;