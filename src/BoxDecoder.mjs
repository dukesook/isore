import Box from './Box.mjs';
export const BoxDecoder = {

  decodeItem(item, raw) {

  },

  decode(box, raw) {
    console.log('BoxDecoder.decode()');
    if (!(box instanceof Box)) {
      console.error('decode() expects a Box object but got: ', typeof box);
      return undefined;
    }


    if (box.fourcc == 'infe') {
      console.log('infe box');
      console.log(box);
      const iinf = box.parent;
      const meta = iinf.parent;
      console.log('meta', meta);
    }
    else {
      // console.log(box);
    }
  },
}

export default BoxDecoder;