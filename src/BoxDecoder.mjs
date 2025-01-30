export const BoxDecoder = {

  decodeItem(item, raw) {

  },

  decode(box, raw) {
    const fourcc = box.type;


    if (fourcc == 'infe') {
      console.log('infe box');
      console.log(box);
    }
    else {
      console.log(box);
    }
  },
}

export default BoxDecoder;