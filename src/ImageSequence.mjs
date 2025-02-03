import RawImage from './RawImage.mjs';

export class ImageSequence {
  images = [];
  fps = null;

  must_be(imageSequence) {
    if (!(imageSequence instanceof ImageSequence)) {
      throw new Error('ImageSequence expected but received ' + typeof imageSequence + ' instead.');
    }
  }

  addImage(image) {
    RawImage.must_be(image);
    this.images.push(image);
  }
}

export default ImageSequence;