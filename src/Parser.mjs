import { MP4Box } from './mp4box.all.js';

/**
 * Parses HEIF file
 */
export const Parser = {
  /**
   * @param {ArrayBuffer} rawFile
   * @returns {TODO} - MP4Box file object
   */
  parseIsoFile(rawFile) {
    if (!(rawFile instanceof ArrayBuffer)) {
      console.error('praseIsoFile() expects an ArrayBuffer but got: ', typeof rawFile);
      return undefined;
    }

    const mp4boxfile = parseWithMp4Box(rawFile);
    
    return mp4boxfile;
  },
};

// Private Functions
function parseWithMp4Box(rawFile) {
  rawFile.fileStart = 0; // MP4Box needs each buffer to have a custom `fileStart` property, supposedly telling which slice of the file this ArrayBuffer refers to.
  const mp4boxfile = MP4Box.createFile();
  mp4boxfile.appendBuffer(rawFile); // MP4Box expects an ArrayBuffer
  mp4boxfile.flush();
  return mp4boxfile;
}

/**
 * Dynamically Load MP4Box
 * Alternatively, you could staticlly load with HTML element: <script src="https://cdn.jsdelivr.net/npm/mp4box/dist/mp4box.all.js"></script>
 * MP4Box does not have a module export, and we can't use the 'import' statement.
 * The main benefits of dynamically loading MP4Box include:
 *  1) Doesn't depend on the global scope
 *  2) Allows for isolated Unit Testing
 *  3) Better performance - only load when needed
 * **/
// async function loadMP4Box() {
//   if (!window.MP4Box) {
//     await new Promise((resolve, reject) => {
//       const script = document.createElement('script');
//       script.src = 'https://cdn.jsdelivr.net/npm/mp4box/dist/mp4box.all.js';
//       script.onload = resolve;
//       script.onerror = reject;
//       document.head.appendChild(script);
//     });
//   }
//   return window.MP4Box;
// }

// async function initMP4Box() {
//   Parser.MP4Box = await loadMP4Box();
// }

// initMP4Box();
