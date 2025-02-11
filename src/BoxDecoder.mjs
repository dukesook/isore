import Box from './Box.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter
import RawImage from './RawImage.mjs';
import ImageGrid from './ImageGrid.mjs';

export const BoxDecoder = {

  decode_item_unci(unci, raw) {
    Box.must_be(unci, 'infe');
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

  get_item_references(grid) {
    Box.must_be(grid, 'infe');
    let references = [];
    const id = grid.item_ID;
    const iinf = grid.parent;
    const meta = iinf.parent;
    const iref = meta.get_child('iref');
    const allReferences = iref.references;
    for (const reference of allReferences) {
      const type = reference.type; // 'thmb', 'auxl', 'dimg', 'base'
      const from_id = reference.from_item_ID;
      const to_ids = reference.references;
      console.log('to_ids:', to_ids);
      const simplifiedList = to_ids.map(item => item.to_item_ID);

      if (item.item_ID == from_id) {

      }
    }
  
  },

  decode_grid_item(grid, raw) {
    Box.must_be(grid, 'infe');
    
    const references = BoxDecoder.get_item_references(grid);
    const imageGrid = new ImageGrid(raw);

    return imageGrid;
  },

  decodeItem(box, raw) {
    Box.must_be(box, 'infe');
    if (box.fourcc != 'infe') {
      throw Error('Expected infe box but got: ' + box.fourcc);
    }

    let data = null;
    if (box.item_type == 'mime') {
      const rawString = new TextDecoder().decode(raw);
      const prettyXML = xmlFormatter(rawString);
      data = prettyXML;
    }
    else if (box.item_type == "unci") {
      const rawImage = BoxDecoder.decode_item_unci(box, raw);
      data = rawImage;
    }
    else if (box.item_type == "grid") {
      data = BoxDecoder.decode_grid_item(box, raw);
    }
    else {
      return "TODO: display item of type: " + box.item_type;
    }

    return data;
  },

  decode(box, raw) {
    Box.must_be(box);
    if (!(raw instanceof ArrayBuffer)) {
      throw Error('Expected raw data to be an ArrayBuffer');
    }

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