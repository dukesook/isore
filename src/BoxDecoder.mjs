import Box from './Box.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter
export const BoxDecoder = {

  decodeItem(box, raw) {
    Box.must_be(box);
    if (box.fourcc != 'infe') {
      throw Error('Expected infe box but got: ' + box.fourcc);
    }


    if (box.item_type == 'mime') {
      const rawString = new TextDecoder().decode(raw);
      const prettyXML = xmlFormatter(rawString);
      return prettyXML;
    } else {
      return "Unknown item type: " + box.item_type;
    }

    
  },

  decode(box, raw) {
    Box.must_be(box);

    if (box.fourcc == 'infe') {
      return this.decodeItem(box, raw);
    }
    else {
      // console.log(box);
    }
  },
}

export default BoxDecoder;