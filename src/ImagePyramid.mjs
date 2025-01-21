/**
 * @class ImagePyramid
 * @classdesc See the HEIF Document (ISO/IEC 23008-12:2024 - Section 8.18.3.2)
 */
export class ImagePyramid {
  tile_size_x = null; // Not needed
  tile_size_y = null; // Not needed
  layers = []; // The first layer is the base, (highest resolution)

  constructor(entity_ids, layer_binnings) {
    // Input Validation
    if (!Array.isArray(entity_ids) || !Array.isArray(layer_binnings)) {
      throw new Error('ImagePyramid constructor expects entity_ids and layer to be an array');
    } else if (entity_ids.length !== layer_binnings.length) {
      throw new Error('ImagePyramid constructor expects entity_ids and layer_binnings to be the same length.');
    }

    // Add Layers
    for (let i = 0; i < entity_ids.length; i++) {
      const layer = new Layer(entity_ids[i], layer_binnings[i]);
      this.layers.push(layer);
    }

    // Validate Layer Binning
    ImagePyramid.validateLayerBinning(this.layers);
  }

  /**
   *
   * @param {ArrayBuffer} rawPyramid
   */
  static parsePyramidData(rawPyramid) {
    if (!(rawPyramid instanceof ArrayBuffer)) {
      throw new Error('ImagePyramid.parsePyramidData expects an ArrayBuffer but received ' + typeof rawPyramid + ' instead.');
    }
    const data = new DataView(rawPyramid);

    const layers = [];
    let offset = 0;
    while (offset < rawPyramid.byteLength) {}

    return layers;
  }

  static validateLayerBinning(layers) {
    for (let i = 0; i < layers.length - 1; i++) {
      const layerBinning = layers[i].layer_binning;
      const nextLayerBinning = layers[i + 1].layer_binning;

      if (layerBinning >= nextLayerBinning) {
        throw new Error('ImagePyramid constructor expects layer_binning to be in increasing order.');
      }
    }
  }
}

class Layer {
  entity_id = null;
  layer_binning = null;
  tiles_in_row = null; // Not needed
  tiles_in_column = null; // Not needed

  constructor(entity_id, layer_binning) {
    if (!Number.isInteger(entity_id) || !Number.isInteger(layer_binning)) {
      throw new Error('Layer constructor expects entity_id and layer_binning to be integers.');
    }
    this.entity_id = entity_id;
    this.layer_binning = layer_binning;
  }
}
