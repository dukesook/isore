import Box from './Box.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter
import RawImage from './RawImage.mjs';

export const BoxDecoder = {

  decode_unci(box, raw) {
    Box.must_be(box);
    const width = 1024;
    const height = 1024;
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
    else {
      // console.log(box);
    }
  },
}

export default BoxDecoder;