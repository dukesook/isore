import Box from './Box.mjs';
export const BoxDecoder = {

  decodeItem(item, raw) {
    Box.must_be(item);
    
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