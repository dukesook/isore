import { Parser } from './Parser.mjs';
import { ImageGrid } from './ImageGrid.mjs';
import { RawImage } from './RawImage.mjs';
import { ImagePyramid } from './ImagePyramid.mjs';

/**
 * This class holds pertent information about an ISO file
 *
 * @property meta Example:
 * meta = {
 *   boxes: [Array of boxes],
 *   idat,
 *   iinf,
 *   iloc,
 *   iprp,
 *   iref,
 *   pitm
 * }
 *
 * @property items Example:
 * items = [Array of items]
 * item = {
 *  item_ID,
 *  item_type,  (grid, unci, mime, uri, etc)
 *  item_name
 * }
 *
 * @property {ImagePyramid} imagePyramid - See ImagePyramid.mjs
 */
export class IsoFile {
  raw = null; // ArrayBuffer of the unparsed ISO file.
  parsedIsoFile = null; // ISO file parsed into boxes.
  items = null; // Shortcut to the metabox items. uncC items will have a RawImage object.
  imagePyramid = null;

  /**
   * Constructor
   * @param {ArrayBuffer} rawIn
   */
  constructor(rawIn) {
    if (!(rawIn instanceof ArrayBuffer)) {
      throw new Error('IsoFile expects an ArrayBuffer but received ' + typeof rawIn + ' instead.');
    }
    this.raw = rawIn;
    this.parsedIsoFile = Parser.parseIsoFile(rawIn);
  }

  /**
   * Computes the offset and length for a tile
   */
  getOffsetAndLength(id, meta) {
    let offset = 0;
    const iloc = meta.iloc;
    let infe_loc = iloc.items.find((item) => item.item_ID == id);

    const extents = infe_loc.extents;
    const extent = extents[0];

    const extentLength = extent.extent_length;

    if (infe_loc.construction_method == 0) {
      offset = infe_loc.base_offset + extent.extent_offset;
    }
    return { offset, length: extentLength };
  }

  /**
   *
   * @param {Number} id
   * @returns meta.iinf.item_infos[id]
   */
  getItem(id) {
    throw Error('IsoFile::getItem - Not implemented');

    // SEARCH ACROSS ALL METABOXES
    return this.items.find((item) => item.item_ID == id);
  }

  getItemData(id) {
    return getItemDataIloc(this, id);
  }

  /**
   * @param {RawImage} tile - Contains pixel data
   */
  static displayTile(tile, row, col, canvas) {
    const dx = col * tile.width;
    const dy = row * tile.height;
    tile.displayOnCanvas(canvas, dx, dy);
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
    buffer = meta.idat.data.buffer; // Base Offset = idat
  }

  // Extract Data
  const itemData = buffer.slice(offset, end);
  return itemData;
}
