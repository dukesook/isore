import { IsoFile } from '/src/IsoFile.mjs';
import { Gui } from '/src/IsoreGui.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter


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
  // isofile = Parser.parseIsoFile(arrayBuffer);
  g_isofile = new IsoFile(arrayBuffer);
  Gui.displayBoxTree(g_isofile);
  let meta = g_isofile.meta;


}
