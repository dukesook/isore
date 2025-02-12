import { Parser } from './Parser.mjs';
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
    // exploreLibheif(arrayBufer);
    // printDimensions(arrayBufer);
  }

}

export default IsoFile;

// DEPRECATED
function getItemDataIloc_OLD(isoFile, id, meta) {

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