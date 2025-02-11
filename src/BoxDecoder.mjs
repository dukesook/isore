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

  get_item_references(grid, id = null) {
    Box.must_be(grid, 'infe');
    let references = [];
    const iinf = grid.parent;
    const meta = iinf.parent;
    const iref = meta.get_child('iref');
    for (const reference of iref.children) {
      if (!id || id == reference.to_item_ID) {
        Box.must_be(reference);
        references.push(reference);
      }
    }
    return references;
  },

  extract_grid_dimg(grid) {
    Box.must_be(grid, 'infe');
    const references = BoxDecoder.get_item_references(grid.item_ID);
    let dimg = null;
    for (const reference of references) {
      if (reference.fourcc == 'dimg') {
        if (dimg) {
          console.error('Warning: More than one dimg reference found for item:', grid.item_ID);
        }
        dimg = reference;
      }
    }
    if (!dimg) {
      throw Error('Missing dimg reference for item: ' + grid.item_ID);
    }
    return dimg;
  },

  decode_grid_item(grid, raw) {
    Box.must_be(grid, 'infe');
    
    const dimg = BoxDecoder.extract_grid_dimg(grid);
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