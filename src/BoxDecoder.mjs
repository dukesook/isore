import Box from './Box.mjs';
import Utility from './Utility.mjs';
import RawImage from './RawImage.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter
import { decodeItem as libheif_decodeItem } from './libs/LibHeif.mjs';
import ImageGrid from './ImageGrid.mjs';

// SRP: The BoxDecoder only decodes. It doesn't parse or traverse
// DON'T import IsoFile

export default class BoxDecoder {

  static decode_item_unci(unci, raw) {
    Box.must_be(unci, 'infe');
    Utility.must_be(raw, ArrayBuffer);

    let ispe = null;
    let uncC = null;
    let cmpd = null;

    const properties = Box.getItemProperties(unci);
    for (const property of properties) {
      if (property.fourcc == 'ispe') {
        ispe = property;
      } else if (property.fourcc == 'uncC') {
        uncC = property;
      } else if (property.fourcc == 'cmpd') {
        cmpd = property;
      }
    }

    if (!ispe) {
      throw Error('Missing ispe property');
    } else if (!uncC) {
      throw Error('Missing uncC property');
    } else if (!cmpd) {
      // Check if uncC version is 1
    }

    const width = ispe.image_width;
    const height = ispe.image_height;


    const pixels = new Uint8Array(raw);
    const rawImage = new RawImage(pixels, width, height);
    return rawImage;
  }

  static decode_item_mime(box, raw) {
    Box.must_be(box, 'infe');
    Utility.must_be(raw, ArrayBuffer);

    const rawString = new TextDecoder().decode(raw);
    const prettyXML = xmlFormatter(rawString);
    return prettyXML;
  }

  static decode_item_hvc1(entireFile, box, encodecPixels) {
    Utility.must_be(entireFile, ArrayBuffer);
    Box.must_be(box, 'infe');
    Utility.must_be(encodecPixels, ArrayBuffer);

    const imageData = libheif_decodeItem(entireFile, box.item_ID);
    Utility.must_be(imageData, ImageData);

    return imageData;
  }

}