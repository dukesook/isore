import { IsoFile } from '/src/IsoFile.mjs';
import { Gui } from '/src/IsoreGui.mjs';
import BoxDecoder from '/src/BoxDecoder.mjs';
import RawImage from '/src/RawImage.mjs';




// File Variables
let g_isofile = null

// HTML Elements
const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    loadLocalFile(file, loadFile, console.log);
  }
});

function loadLocalFile(file, successCallback, errCallback) {
  const reader = new FileReader();

  // If success
  reader.onload = function (event) {
    const localFile = event.target.result; // ArrayBuffer
    successCallback(localFile);
  };

  // If error
  reader.onerror = function (error) {
    console.error('Error reading file:', error);
    errCallback();
  };

  // Execute!
  reader.readAsArrayBuffer(file);
}


function loadFile(arrayBuffer) {
  // Create IsoFile object
  g_isofile = new IsoFile(arrayBuffer);

  // Display Box Tree
  const tree = document.getElementById('box-tree');
  const htmlContainer = document.getElementById('box-metadata');
  const mdatContainer = document.getElementById('mdat-display');
  const canvas = document.getElementById('canvas');
  
  const callback = createBoxTreeListener(htmlContainer, mdatContainer, canvas);

  Gui.displayBoxTree(g_isofile, tree, callback);

}


function createBoxTreeListener(htmlContainer, mdatContainer, canvas) {
  const boxTreeListener = function (box) {
    // Display Box
    Gui.displayBox(box, htmlContainer);

    // Handle Box Data (if any)
    const raw = g_isofile.getBoxData(box);   
    if (raw) {
      const data = BoxDecoder.decode(box, raw);
      if (typeof data === 'string') {
        Gui.displayText(data, mdatContainer);
      }
      else if (data instanceof RawImage) {
        Gui.displayRawImage(data, canvas);
      }
    }
  }
  return boxTreeListener;
}
