import Box from './Box.mjs';
import RawImage from './RawImage.mjs';
import ImageGrid from './ImageGrid.mjs';
import Utility from './Utility.mjs';
import IsoFile from './IsoFile.mjs';
import BoxDecoder from './BoxDecoder.mjs';
import ImageSequence from './ImageSequence.mjs';

export default class BoxHandler {

  /**
   * 
   * @returns null if box doesn't have mdat/idat data
   */
  static getBoxData(isoFile, box) {
    Box.must_be(box);
    Utility.must_be(isoFile, IsoFile);

    const fourcc = box.fourcc;
    let boxData = null;
    if (fourcc == 'infe') {
      boxData = BoxHandler.getItemData(isoFile, box);
    }
    else if (fourcc == 'trak') {
      boxData = getTrackData(isoFile, box);
    }
    else {
      return null;
    }

    return boxData;
  }


  static getItemData(isoFile, box) {
    Box.must_be(box, 'infe');
    Utility.must_be(isoFile, IsoFile);

    const raw = BoxHandler.getItemRawData(isoFile, box);
    if (!raw) {
      console.error('Item has no mdat/idat data? ' + box);
      return null;
    }

    Utility.must_be(raw, ArrayBuffer);

    let decodedItem = null;
    if (box.item_type == 'mime') {
      decodedItem = BoxDecoder.decode_item_mime(box, raw);
    }
    else if (box.item_type == "unci") {
      decodedItem = BoxDecoder.decode_item_unci(box, raw);
    }
    else if (box.item_type == "grid") {
      decodedItem = BoxHandler.getGridItem(isoFile, box, raw);
    }
    else if (box.item_type == "hvc1") {
      decodedItem = BoxDecoder.decode_item_hvc1(isoFile.raw, box, raw);
    }
    else {
      return "TODO: display item of type: " + box.item_type;
    }

    return decodedItem;
  }


  static getGridItem(isoFile, box, raw) {
    Utility.must_be(isoFile, IsoFile);
    Box.must_be(box, 'infe');
    Utility.must_be(raw, ArrayBuffer);  // Grid data from mdat/idat
  
    const imageGrid = new ImageGrid(raw);
    
    // Get to_ids
    const references = BoxHandler.get_item_references(box);
    const dimg = BoxHandler.get_grid_dimg(references);
    const to_ids = dimg.to_ids;

    // Populate imageGrid with images
    const iinf = box.parent;
    const meta = iinf.parent;
    for (const id of to_ids) {
      const tile = BoxHandler.getItemById(meta, id);
      const rawImage = BoxHandler.getItemData(isoFile, tile);
      imageGrid.addImage(rawImage);
    }

    return imageGrid;
  }


  static decodeTrack(box, isoFile) {
    Box.must_be(box, 'trak');
    Utility.must_be(isoFile, IsoFile);
    throw Error('Not implemented yet');
  }


  static getItemById(meta, id) {
    Box.must_be(meta, 'meta');
    Utility.must_be(id, Number);

    const iinf = meta.get_child('iinf');
    const items = iinf.children;
    const item = items.find((item) => item.item_ID == id);
    if (!item) {
      throw Error('Item not found: ' + id);
    }
    Box.must_be(item, 'infe');
    return item;
  }


/**
 * @returns { ArrayBuffer } raw mdat/idat data
 */
  static getItemRawData(isoFile, box) {
    Utility.must_be(isoFile, IsoFile);
    Box.must_be(box, 'infe');

    const iinf = box.parent;
    const meta = iinf.parent;
    const iloc = meta.get_child('iloc');

    // Find Item
    const itemLocation = iloc.items.find((item) => item.item_ID == box.item_ID);
    if (!itemLocation) {
      return null;
    }
    if (itemLocation.extents.length != 1) {
      throw Error('iloc item ' + id + ' has ' + extents.length + ' extents. Only one extent is supported');
    }

    const extent = itemLocation.extents[0];
    const length = extent.extent_length;
    const offset = itemLocation.base_offset + extent.extent_offset;
    const end = offset + length;
    const construction_method = itemLocation.construction_method;
    
    if (end > isoFile.raw.byteLength) {
      throw Error('Item extends beyond the end of the file');
    }

    // Construction Method
    let buffer = null;
    if (construction_method == 0) {
      buffer = isoFile.raw; // Base Offset = file (absolute offset)
    } else if (construction_method == 1) {
      // buffer = meta.idat.data.buffer; // Base Offset = idat
      const idat = meta.get_child('idat');
      buffer = idat.raw;
    } else {
      throw Error('Unsupported construction method: ' + construction_method);
    }

    // Extract Data
    const itemData = buffer.slice(offset, end);
    console.log('itemData:', itemData);
    console.log('type of itemData:', typeof itemData);
    return itemData;

  }


  static get_grid_dimg(references) {
    Utility.must_be(references, Array);

    // const references = BoxDecoder.get_item_references(grid);
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


/**
 * 
 * @returns  {Array} Array of references to the item
 */
  static get_item_references(item) {
    Box.must_be(item, 'infe');
    let references = [];
    const id = item.item_ID;
    const iinf = item.parent;
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

} // class BoxHandler


function getTrackData(isoFile, trak) {
  Box.must_be(trak, 'trak');
  Utility.must_be(isoFile, IsoFile);

  // TODO - verify that this track is indeed an image sequence
  const imageSequence = new ImageSequence();
  const raw = isoFile.raw;

  const {width, height} = getTrackWidthHeight(trak);

  for (let i = 0; i < trak.samples.length; i++) {
    const sample = trak.samples[i];
    const offset = sample.offset;
    const sampleSize = sample.size;
    const sampleData = raw.slice(offset, offset + sampleSize);
    const rawImage = new RawImage(sampleData, width, height);
    imageSequence.addImage(rawImage);
  }

  return imageSequence;

}

function getTrackWidthHeight(trak) {
  Box.must_be(trak, 'trak');
  const tkhd = trak.get_child('tkhd');
  let width = tkhd.width >> 16;
  let height = tkhd.height >> 16;
  return { width, height };
}

