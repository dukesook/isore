import Box from './Box.mjs';
export const BoxDecoder = {

  decodeItem(item, raw) {

  },

  decode(box, raw) {
    if (!(box instanceof Box)) {
      console.error('decode() expects a Box object but got: ', typeof box);
      return undefined;
    }


    if (box.fourcc == 'infe') {
      const iinf = box.parent;
      const meta = iinf.parent;
    }
    else {
      // console.log(box);
    }
  },
}

export default BoxDecoder;