import RawImage from './RawImage.mjs';
/**
 * @class ImageGrid
 * @classdesc See the HEIF Document (ISO/IEC 23008-12:2017 - Section 6.6.2.3.2)
 */
export class ImageGrid {
  rows = 0;     // The number of rows in the grid.
  columns = 0;  // The number of columns in the grid
  gridWidth = 0;
  gridHeight = 0;
  tileWidth = 0;
  tileHeight = 0;
  rawImages = [];

  constructor(rawGrid) {
    const gridData = ImageGrid.parseGridData(rawGrid);
    this.rows = gridData.rows;
    this.columns = gridData.columns;
    this.gridWidth = gridData.gridWidth;
    this.gridHeight = gridData.gridHeight;
    this.tileWidth = gridData.tileWidth;
    this.tileHeight = gridData.tileHeight;
  }

  /**
   *
   * @param {ArrayBuffer} rawGrid
   * @returns {Object} Parsed grid data
   */
  static parseGridData(rawGrid) {
    const dataView = new DataView(rawGrid);
    let offset = 0;

    // Read version
    const version = dataView.getUint8(offset);
    offset += 1;

    // Read flags
    const flags = dataView.getUint8(offset);
    offset += 1;

    // Calculate FieldLength
    const FieldLength = ((flags & 1) + 1) * 16;

    // Read rows_minus_one
    const rows_minus_one = dataView.getUint8(offset);
    const rows = rows_minus_one + 1;
    offset += 1;

    // Read columns_minus_one
    const columns_minus_one = dataView.getUint8(offset);
    const columns = columns_minus_one + 1;
    offset += 1;

    // Read gridWidth
    let gridWidth;
    if (FieldLength === 16) {
      gridWidth = dataView.getUint16(offset, false); // false for big-endian
      offset += 2;
    } else if (FieldLength === 32) {
      gridWidth = dataView.getUint32(offset, false);
      offset += 4;
    }

    // Read gridHeight
    let gridHeight;
    if (FieldLength === 16) {
      gridHeight = dataView.getUint16(offset, false);
      offset += 2;
    } else if (FieldLength === 32) {
      gridHeight = dataView.getUint32(offset, false);
      offset += 4;
    }

    const tileWidth = gridWidth / columns;
    const tileHeight = gridHeight / rows;

    return {
      // version,
      // flags,
      // FieldLength,
      rows,
      columns,
      gridWidth,
      gridHeight,
      tileWidth,
      tileHeight,
    };
  }

  addImage(image) {
    RawImage.must_be(image);
    this.rawImages.push(image);
  }
}

export default ImageGrid;