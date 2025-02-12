import Box from './Box.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter
import RawImage from './RawImage.mjs';
import ImageGrid from './ImageGrid.mjs';
import Utility from './Utility.mjs';

export default class BoxHandler {

  static decode_item_unci(unci, raw) {
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
  }

  static get_item_references(grid) {
    Box.must_be(grid, 'infe');
    let references = [];
    const id = grid.item_ID;
    const iinf = grid.parent;
    const meta = iinf.parent;
    const iref = meta.get_child('iref');
    for (const reference of iref.children) {
      if (id == reference.from_item_ID) {
        Box.must_be(reference);
        references.push(reference);
      }
    }
    return references;
  }

  static extract_grid_dimg(grid) {
    Box.must_be(grid, 'infe');
    const references = BoxHandler.get_item_references(grid);
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
  }

  static decode_grid_item(grid, raw) {
    Box.must_be(grid, 'infe');
    
    const dimg = BoxHandler.extract_grid_dimg(grid);
    Box.must_be(dimg, 'dimg');
    const imageGrid = new ImageGrid(raw);

    to_ids = dimg.to_item_IDs;
    const iinf = grid.parent;
    const meta = iinf.parent;
    for (const id of to_ids) {
      const item = null;
      // TODO: Get item box given an id;


      Box.must_be(item, 'infe');
      const rawImage = BoxHandler.decodeItem(item, raw);
      Utility.must_be(rawImage, RawImage);

    }


    return imageGrid;
  }

  static decodeItem(box, raw) {
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
      const rawImage = BoxHandler.decode_item_unci(box, raw);
      data = rawImage;
    }
    else if (box.item_type == "grid") {
      data = BoxHandler.decode_grid_item(box, raw);
    }
    else {
      return "TODO: display item of type: " + box.item_type;
    }

    return data;
  }

  static decode(box, raw) {
    Box.must_be(box);
    if (!(raw instanceof ArrayBuffer)) {
      throw Error('Expected raw data to be an ArrayBuffer');
    }

    if (box.fourcc == 'infe') {
      return BoxHandler.decodeItem(box, raw);
    }
    else if (box.fourcc == 'trak') {
      return raw;
    }
    else {
      // console.log(box);
    }
  }
}
