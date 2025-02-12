import Box from './Box.mjs';
import RawImage from './RawImage.mjs';
import ImageGrid from './ImageGrid.mjs';
import Utility from './Utility.mjs';
import IsoFile from './IsoFile.mjs';
import BoxDecoder from './BoxDecoder.mjs';

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
      boxData = getTrackData(box, isoFile.raw);
    }
    else {
      return null;
    }

    return boxData;
  }

//********************************************************************** */


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
      decodedItem = BoxHandler.decode_grid_item(box, raw);
    }
    else {
      return "TODO: display item of type: " + box.item_type;
    }

    return decodedItem;
  }

  static decodeTrack(box, isoFile) {
    Box.must_be(box, 'trak');
    Utility.must_be(isoFile, IsoFile);
    throw Error('Not implemented yet');
  }


/**
 * @returns { ArrayBuffer } raw mdat/idat data
 */
  static getItemRawData(isoFile, box) {
    Utility.must_be(isoFile, IsoFile);
    Box.must_be(box, 'infe');

    let raw = null;
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
      const idat = meta.get(child('idat'));
      buffer = idat.data.buffer;
    } else {
      throw Error('Unsupported construction method: ' + construction_method);
    }

    // Extract Data
    const itemData = buffer.slice(offset, end);
    return itemData;

  }

//********************************************************************** */






// GRID ITEM //
//********************************************************************** */
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
      const rawImage = BoxHandler.getItemData(item, raw);
      Utility.must_be(rawImage, RawImage);

    }

    return imageGrid;
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

  //********************************************************************** */
  // GRID ITEM //







} // class BoxHandler


function getTrackData(trak, raw) {
  Box.must_be(trak, 'trak');

  const imageSequence = new ImageSequence();

  const {width, height} = IsoFile.getTrackWidthHeight(trak);

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

