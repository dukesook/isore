import LibheifFactory from 'https://cdn.jsdelivr.net/npm/libheif-js@1.18.2/libheif-wasm/libheif-bundle.mjs';

const libheif = LibheifFactory();
const HeifDecoder = libheif.HeifDecoder;

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

export default libheif;