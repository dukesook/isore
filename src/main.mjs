import { Parser } from './Parser.mjs';



// JavaScript to handle file loading
const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    loadLocalFile(file, displayFile, success);
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

function success(x) {
  console.log('success')
  console.log(x)
}

function displayFile(arrayBuffer) {
  let mp4boxfile = Parser.parseHeif(arrayBuffer);
  console.log(mp4boxfile.meta);

}

