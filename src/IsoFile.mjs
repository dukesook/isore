import { Parser } from './Parser.mjs';
import { ImageGrid } from './ImageGrid.mjs';
import { RawImage } from './RawImage.mjs';
import ImageSequence from './ImageSequence.mjs';
import Box from './Box.mjs';
import { printDimensions, exploreLibheif } from './libs/LibHeif.mjs';
import Utility from './Utility.mjs';

export class IsoFile {
  raw = null; // ArrayBuffer of the entire ISO file.
  boxes = null; // Array of Boxes

  constructor(rawIn) {
    Utility.must_be(rawIn, ArrayBuffer);

    this.raw = rawIn;
    this.boxes = Parser.parseIsoFile(rawIn);
    this.debugLibheif(rawIn);
  }

  debugLibheif(arrayBufer) {
    exploreLibheif(arrayBufer);
    // printDimensions(arrayBufer);
  }


  getBoxData(box) {
    Box.must_be(box);
    let boxData = null;

    if (box.fourcc == 'infe') {
      const iinf = box.parent;
      const meta = iinf.parent;
      const id = box.item_ID;
      boxData = getItemDataIloc(this, id, meta);
    }
    else if (box.fourcc == 'trak') {
      boxData = this.getTrackData(box, this.raw);
    }
    else {
      console.log('IsoFile::getBoxData - Unhandled box:', box);
    }

    return boxData;
  }

  getTrackData(trak, raw) {
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

  static getTrackWidthHeight(trak) {
    Box.must_be(trak, 'trak');
    const tkhd = trak.get_child('tkhd');
    let width = tkhd.width >> 16;
    let height = tkhd.height >> 16;
    return { width, height };
  }

}

/**
 *  Use the iloc (Items Location Box) to retrieve the item data. Usually in mdat or idat.
 * @param {IsoFile} isoFile
 * @param {Number} id
 * @returns {ArrayBuffer} - The raw data for the item.
 *                          Returns null if the item is not found or the data is out of bounds.
 */
function getItemDataIloc(isoFile, id, meta) {
  const rawFile = isoFile.raw;

  // Find Item
  const itemLocation = meta.iloc.items.find((item) => item.item_ID == id);
  if (!itemLocation) {
    return null;
  }

  // Calculate Offset and Length
  if (itemLocation.extents.length != 1) {
    throw Error('Expecting exactly one extent but found ' + itemLocation.extents.length + ' instead.');
  }
  const extent = itemLocation.extents[0];
  const length = extent.extent_length;
  const offset = itemLocation.base_offset + extent.extent_offset;
  const end = offset + length;

  if (end > rawFile.byteLength) {
    return null;
  }

  // Construction Method
  let buffer = null;
  if (itemLocation.construction_method == 0) {
    buffer = rawFile; // Base Offset = file (absolute offset)
  } else if (itemLocation.construction_method == 1) {
    console.log('meta:', meta);
    buffer = meta.idat.data.buffer; // Base Offset = idat
  }

  // Extract Data
  const itemData = buffer.slice(offset, end);
  return itemData;
}

export default IsoFile;