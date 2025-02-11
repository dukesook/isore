import LibheifFactory from 'https://cdn.jsdelivr.net/npm/libheif-js@1.18.2/libheif-wasm/libheif-bundle.mjs';

const libheif = LibheifFactory();
const HeifDecoder = libheif.HeifDecoder;

export function exploreLibheif(arrayBuffer) {
    console.log('libheif:', libheif);
    console.log('libheif:', libheif);   
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