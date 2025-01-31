import { MP4Box } from './mp4box.all.js';
import Box from './Box.mjs';

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
    const boxes = toBoxArray(mp4boxfile);
    return boxes;
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
 * Convert the MP4Box output to an array of Box objects
 * @param {*} mp4boxfile 
 * @returns 
 */
function toBoxArray(mp4boxfile) {
  const boxes = [];

  mp4boxfile.boxes.forEach((mp4box) => {
    let box = toBox(mp4box);
    boxes.push(box);
  });

  return boxes;
}

function toBox(mp4box_object, parent = null) {
  let new_box = new Box();
  new_box.parent = parent;

  // Update values when names don't match
  Object.entries(mp4box_object).forEach(([key, value]) => {
    if (key === 'hdr_size') {
      new_box.hdr_size = value;
    }
    else if (key === 'type') {
      new_box.fourcc = value;
    }
    else if (key === 'data') {
      new_box.raw = value;
    }
    else if (key === 'boxes' || key === "item_infos" || key === 'entries') {
      value.forEach((mp4box_child) => {
        const child = toBox(mp4box_child, new_box);
        new_box.children.push(child);
      });
    }
    else {
      new_box[key] = value; // MP4Box & Box names match
    }
  });
  return new_box;
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
