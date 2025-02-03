import { IsoFile } from '/src/IsoFile.mjs';
import { Gui } from '/src/IsoreGui.mjs';
import BoxDecoder from '/src/BoxDecoder.mjs';
import RawImage from '/src/RawImage.mjs';
import ImageSequence from './ImageSequence.mjs';




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
  const boxTreeDump = document.getElementById('box-tree-dump');
  const mdatCanvas = document.getElementById('mdat-canvas');
  const mdatText = document.getElementById('mdat-text');

  // Create Callback
  const callback = createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas);

  Gui.displayBoxTree(g_isofile, tree, callback);

}


function createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas) {
  const boxTreeListener = function (box) {
    // Display Box
    Gui.displayBox(box, boxTreeDump);

    // Handle Box Data (if any)
    const data = g_isofile.getBoxData(box);
    if (!data) {
      // Do Nothing
    } else if (typeof data === 'string') {
      Gui.displayText(data, mdatText);
      Gui.hideContainer(mdatCanvas);
    } else if (data instanceof RawImage) {
      Gui.displayRawImage(data, mdatCanvas);
      Gui.hideContainer(mdatText);
    } else if (data instanceof ImageSequence) {
      const image = data.images[0];
      Gui.displayRawImage(image, mdatCanvas);      
      Gui.hideContainer(mdatText);
    }
  }
  return boxTreeListener;
}


