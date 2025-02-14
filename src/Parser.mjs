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

// Convert MP4Box objects to an intuitive Format
function toBox(mp4box_object, parent = null) {
  let new_box = new Box();
  new_box.parent = parent;
  const fourcc = mp4box_object.type;

  if (mp4box_object.type == 'idat') {
    // console.log('idat:', mp4box_object);
  }

  // Update values when names don't match
  Object.entries(mp4box_object).forEach(([key, value]) => {

    if (value instanceof Uint8Array) {
      value = value.buffer; // Convert to ArrayBuffer
    }

    if (key === 'type') {
      new_box.fourcc = value;
    }
    else if (key === 'data') {
      new_box.raw = value;
    }
    // else if (fourcc == 'iloc' && key == 'items') {
    //   console.log(mp4box_object);
    // }
    else if ( key === 'boxes' ||
              key === "item_infos" ||
              key === 'entries' ||
              key === 'references' && parent.fourcc == 'meta') {
      // boxes, item_infos, entries, & references are children boxes
      value.forEach((mp4box_child) => {
        const child = toBox(mp4box_child, new_box);
        new_box.children.push(child);
      });
    }
    else if (key === 'references' && parent.fourcc == 'iref') {
      new_box.to_ids = value.map(item => item.to_item_ID);
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
