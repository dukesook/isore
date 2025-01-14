import { Parser } from './Parser.mjs';

const itemsContainer = document.getElementById("items-container");

// JavaScript to handle file loading
const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    loadLocalFile(file, displayFile, fail);
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

function fail(x) {
  console.log('fail')
  console.log(x)
}

function displayFile(arrayBuffer) {
  let mp4boxfile = Parser.parseHeif(arrayBuffer);
  let meta = mp4boxfile.meta;

  let boxes = meta.boxes;

  // Find box of type 'iinf'
  let iinf = boxes.find(box => box.type === 'iinf');
  let items = iinf.item_infos;

  const ul = document.createElement("ul");

    // Iterate through items and add each as an <li>
    for (let item of items) {
      const li = document.createElement("li"); // Create a new <li> element
      //   console.log('name:', item.item_name);
      //   console.log('uuid:', item.item_uuid);
    li.textContent = item.item_ID + '. ' + item.item_type;
    ul.appendChild(li);                      // Append the <li> to the <ul>
  }

  itemsContainer.appendChild(ul);            // Append the <ul> to the container
}

