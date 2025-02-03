import Box from './Box.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter
import RawImage from './RawImage.mjs';

export const BoxDecoder = {

  decode_unci(unci, raw) {
    Box.must_be(unci);
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
  },

  decodeItem(box, raw) {
    Box.must_be(box);
    if (box.fourcc != 'infe') {
      throw Error('Expected infe box but got: ' + box.fourcc);
    }


    if (box.item_type == 'mime') {
      const rawString = new TextDecoder().decode(raw);
      const prettyXML = xmlFormatter(rawString);
      return prettyXML;
    } else if (box.item_type == "unci") {
      const rawImage = BoxDecoder.decode_unci(box, raw);
      return rawImage;
    }
    else {
      return "TODO: display item of type: " + box.item_type;
    }

    
  },

  decode(box, raw) {
    Box.must_be(box);

    if (box.fourcc == 'infe') {
      return BoxDecoder.decodeItem(box, raw);
    }
    else if (box.fourcc == 'trak') {
      return raw;
    }
    else {
      // console.log(box);
    }
  },
}

export default BoxDecoder;