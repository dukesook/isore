import LibheifFactory from 'https://cdn.jsdelivr.net/npm/libheif-js@1.18.2/libheif-wasm/libheif-bundle.mjs';

const libheif = LibheifFactory();
const HeifDecoder = libheif.HeifDecoder;

export async function decodeItem(entireFile, itemId) {
  const image = getEncodedItemById(entireFile, itemId);
  
  // Create an ImageData object to hold the pixel data
  const width = image.get_width();
  const height = image.get_height();
  const imageData = new ImageData(width, height);
  

  // Decode and retrieve the pixel data
  await new Promise(function (resolve, reject) {
    image.display(imageData, function (displayData) {
      if (!displayData) {
        reject(new Error('HEIF processing error'));
        return;
      }
      resolve();
    });
  });
  console.log('imageData:', imageData);
  return imageData;
}
  

export function exploreLibheif(arrayBuffer) {
    
  const version = libheif.heif_get_version();
  console.log('version:', version);
    
  const ctx = libheif.heif_context_alloc();
  console.log('heif_context:', ctx);

  const heif_error = libheif.heif_context_read_from_memory(ctx, arrayBuffer);
  console.log('heif_error:', heif_error);

  const num = libheif.heif_context_get_number_of_top_level_images(ctx);
  console.log('num:', num);

  const ids = libheif.heif_js_context_get_list_of_top_level_image_IDs(ctx);
  console.log('ids:', ids);

  for (let i = 0; i < num; i++) {
    const id = ids[i];
    const handle = libheif.heif_js_context_get_image_handle(ctx, id);
    console.log('handle:', handle);
  }

}

export function printDimensions(arrayBuffer) {
  const decoder = new HeifDecoder();

  const data = decoder.decode(arrayBuffer);
  const image = data[0];
  const width = image.get_width();
  const height = image.get_height();
  console.log('width:', width);
  console.log('height:', height);    
}

function getEncodedItemById(entireFile, itemId) {
  const decoder = new HeifDecoder();
  const data = decoder.decode(entireFile);
  const ctx = libheif.heif_context_alloc();
  const heif_error = libheif.heif_context_read_from_memory(ctx, entireFile);
  const ids = libheif.heif_js_context_get_list_of_top_level_image_IDs(ctx);
  console.log('ids:', ids);

  if (ids.length != data.length) {
    throw new Error('Number of IDs does not match number of images');
  }

  for (let i = 0; i < ids.length; i++) {
    const image = data[i];
    if (ids[i] === itemId) {
      return image;
    }
  }

  return null; // Item not found
}

export default libheif;