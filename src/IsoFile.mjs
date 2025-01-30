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
  meta = null; // Shortcut to the metabox in parsedIsoFile.
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
    
    // Avoid this because there may be multiple meta boxes
    // this.meta = this.parsedIsoFile.meta; // Shortcut to metabox
    // this.items = this.meta.iinf.item_infos; // Shortcut to items
    // setItems(this);
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
    return this.items.find((item) => item.item_ID == id);
  }

  getItemData(id) {
    return getItemDataIloc(this, id);
  }

  storeImage(tileId, rawImage) {
    if (!rawImage instanceof RawImage) {
      throw Error('IsoFile.storeTile() expects a RawImage object but received ' + typeof rawImage + ' instead.');
    }
    const tile = this.getItem(tileId);
    tile.rawImage = rawImage;
  }

  getItemReferences(id) {
    const isoFile = this;
    const meta = isoFile.meta;
    const allReferences = meta.iref.references; // Array of references
    const itemReferences = allReferences.filter((ref) => ref.from_item_ID == id);
    return itemReferences;
  }

  identifyMissingTiles(tileIds) {
    const missingTiles = tileIds.filter((id) => {
      const item = this.getItem(id);
      const rawImage = item.rawImage;
      return !(rawImage instanceof RawImage);
    });
    return missingTiles;
  }

  getGridData(gridId) {
    const isoFile = this;
    const rawData = getItemDataIloc(isoFile, gridId);
    const gridData = ImageGrid.parseGridData(rawData);
    return gridData;
  }

  /**
   * Map tile Ids to their rows and columns
   *
   * @param {Number} gridId
   * @returns 2D array of tile Ids (Number)
   */
  getTileIdMap(gridId) {
    const isoFile = this;
    const references = isoFile.getItemReferences(gridId);

    //Find the reference with the type 'dimg'
    const dimgReferences = references.filter((ref) => ref.type == 'dimg');
    if (dimgReferences.length != 1) {
      throw Error('Expecting exactly one dimg reference but found ' + dimgReferences.length + ' instead.');
    }
    const dimg = dimgReferences[0];
    const tileIds_1dArray = dimg.references;

    const data = getItemDataIloc(isoFile, gridId);
    const gridData = ImageGrid.parseGridData(data);
    let { rows, columns } = gridData;

    // Convert to 2D array
    let tileIdMap = [];
    let i = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (!tileIdMap[row]) {
          tileIdMap[row] = [];
        }
        let id = tileIds_1dArray[i++].to_item_ID;
        tileIdMap[row][col] = id;
      }
    }
    return tileIdMap;
  }

  getGridIdForTile(tileId) {
    const items = this.items;
    let gridId = null;
    let gridItems = [];
    items.forEach((item) => {
      if (item.item_type === 'grid') {
        gridItems.push(item);
      }
    });

    gridItems.forEach((gridItem) => {
      const tileIds = gridItem.tileIds;
      const tileIdsFlat = tileIds.flat();

      tileIdsFlat.forEach((id) => {
        if (id == tileId) {
          gridId = gridItem.item_ID;
        }
      });
    });
    return gridId;
  }

  getTileRowAndColumn(tileId) {
    const isoFile = this;
    const gridId = isoFile.getGridIdForTile(tileId);
    const gridItem = isoFile.getItem(gridId);
    const { rows, columns } = gridItem.imageGrid;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (gridItem.tileIds[row][column] == tileId) {
          return { row, column };
        }
      }
    }
    throw Error('Tile not found');
  }

  /**
   *  Gets the tiles that lie within a given radius.
   *
   * @param {Number} ptx - Point x
   * @param {Number} pty - Point y
   * @param {Number} radius - Radius in pixels
   * @param {Number} gridId - The id of the grid that we're searching through
   * @returns {Array} - List of tile Ids that lie within the radius
   */
  getTilesInRadius(ptx, pty, radius, gridId) {
    const isoFile = this;
    const gridData = isoFile.getGridData(gridId);
    const tileIdMap = isoFile.getTileIdMap(gridId);

    const { rows, columns, tileWidth, tileHeight } = gridData;
    let tileIds = [];
    let ulx = ptx - radius;
    let uly = pty - radius;
    let lrx = ptx + radius;
    let lry = pty + radius;
    let ulTileRow = Math.floor(uly / tileHeight);
    let ulTileCol = Math.floor(ulx / tileWidth);
    let lrTileRow = Math.floor(lry / tileHeight);
    let lrTileCol = Math.floor(lrx / tileWidth);
    let inc = 0;
    ulTileRow = Math.max(0, Math.min(ulTileRow, rows - 1));
    lrTileRow = Math.max(0, Math.min(lrTileRow, rows - 1));
    ulTileCol = Math.max(0, Math.min(ulTileCol, columns - 1));
    lrTileCol = Math.max(0, Math.min(lrTileCol, columns - 1));

    for (let row = ulTileRow; row <= lrTileRow; row++) {
      for (let col = ulTileCol; col <= lrTileCol; col++) {
        tileIds[inc++] = tileIdMap[row][col];
      }
    }
    return tileIds;
  }

  /**
   * @param {RawImage} tile - Contains pixel data
   */
  static displayTile(tile, row, col, canvas) {
    const dx = col * tile.width;
    const dy = row * tile.height;
    tile.displayOnCanvas(canvas, dx, dy);
  }

  setImagePyramid(pymd) {
    const entity_ids = pymd.entity_ids;
    const layer_binnings = pymd.layer_binning;
    this.imagePyramid = new ImagePyramid(entity_ids, layer_binnings);
  }
}

/**
 * Each unci item stores the pixel data in the rawImage object.
 * Each grid item has 2 objects:
 *   1) imageGrid: Contains metadata about the grid
 *   2) tileIds: 2D array of tile Ids
 * @param {IsoFile} isoFile
 */
function setItems(isoFile) {
  const items = isoFile.items;

  items.forEach((item) => {
    const type = item.item_type;
    const id = item.item_ID;
    const raw = getItemDataIloc(isoFile, id);
    if (!raw) {
      return;
    } else if (type === 'grid') {
      // Save Grid Metadata
      item.imageGrid = new ImageGrid(raw);

      // Save Tile Ids
      let tileIdMap = isoFile.getTileIdMap(id);
      item.tileIds = tileIdMap;
    } else if (type === 'unci') {
      const width = 512; // TODO: Don't hard code. Read ispe box.
      const height = 512; // TODO: Don't hard code. Read ispe box.
      item.rawImage = new RawImage(new Uint8Array(raw), width, height);
    } else if (type === 'hvc1') {
      // TODO: Implement
    } else if (type === 'mime') {
      // TODO: Implement
    } else if (type === 'uri ') {
      // TODO: Implement
    } else if (type === 'Exif') {
      // TODO: Implement
    } else {
      throw Error('Unknown item type: ' + type);
    }

    if (raw) {
    }
  });
}

/**
 *  Use the iloc (Items Location Box) to retrieve the item data. Usually in mdat or idat.
 * @param {IsoFile} isoFile
 * @param {Number} id
 * @returns {ArrayBuffer} - The raw data for the item.
 *                          Returns null if the item is not found or the data is out of bounds.
 */
function getItemDataIloc(isoFile, id) {
  const meta = isoFile.meta;
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
