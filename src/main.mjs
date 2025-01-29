import { IsoFile } from '/src/IsoFile.mjs';
import { Gui } from '/src/IsoreGui.mjs';
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter


// File Variables
let g_isofile = null

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    loadLocalFile(file, loadFile, fail);
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

function loadFile(arrayBuffer) {
  // isofile = Parser.parseIsoFile(arrayBuffer);
  g_isofile = new IsoFile(arrayBuffer);
  displayBoxTree(g_isofile);
  let meta = g_isofile.meta;

  const items = meta.iinf.item_infos;
  let itemsTable = document.getElementById('items-table');
  Gui.displayItemsOnTable(items, itemsTable, displayItem);

  const properties = meta.iprp.ipco.boxes;
  let propertiesTable = document.getElementById('properties-table');
  Gui.displayPropertiesOnTable(properties, propertiesTable);

  const locations = meta.iloc.items;
  let locationsTable = document.getElementById('locations-table');
  Gui.displayItemLocations(locations, locationsTable);

  if (meta.iref) {
    const references = meta.iref.references;
    let referencesTable = document.getElementById('references-table');
    Gui.displayReferencesOnTable(references, referencesTable);
  }

  if (meta.grpl) {
    const groupList = meta.grpl.boxes;
    let groupListTable = document.getElementById('groupListTable');
    Gui.displayGroupListOnTable(groupList, groupListTable);
  }
}

/**
 * 
 * @param {IsoFile} isoFile 
 */
function displayBoxTree(isoFile) {
  const div = document.querySelector('#box-tree');
  div.innerHTML = '';
  const root_container = document.createElement('ul');
  div.appendChild(root_container);
  const root_box = isoFile.parsedIsoFile;
  root_box.boxes.forEach((box) => {
    addBoxToTree(box, root_container);
  })
  setTreeListeners();
}


function addBoxToTree(box, container) {
  const fourcc = box.type
  let children = box.boxes;

  if (fourcc == 'iinf') {
    children = box.item_infos;
  }

  const li = document.createElement('li');
  li.textContent = fourcc; // box.type == 4cc
  container.appendChild(li);
  li.addEventListener('click', (event) => {
    displayBox(box);
  });

  // Add Children
  if (children) {
    li.classList.add('toggle');
    const childContainer = document.createElement('ul');
    childContainer.classList.add('hidden');
    container.appendChild(childContainer);
    children.forEach((childBox) => {
      addBoxToTree(childBox, childContainer);
    });
  }
}


function displayBox(box) {
  console.log(box);
  console.log(typeof box);
  const boxMetadata = document.getElementById('box-metadata');
  
  // Clear Previous Content
  boxMetadata.innerHTML = '';

  // Create Table
  const table = document.createElement('table');
  boxMetadata.appendChild(table);

  // Add Rows
  

  Object.entries(box).forEach(([key, value]) => {
    console.log(`${key}: ${box[key]}`);
    const row = document.createElement('tr');
    const keyCell = document.createElement('td');
    keyCell.textContent = key;
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    row.appendChild(keyCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  });

  return;
  const fourcc = box.type;
  if (fourcc == 'infe') {
    displayItem(box);
  } else {
    document.getElementById('main-content').textContent = "Unknown box type: " + fourcc;
  }
}


function displayItem(item) {
  console.log('clicked item', item);
  const id = item.item_ID;
  console.log(id)
  const raw = g_isofile.getItemData(id);
  console.log('item: ', raw);
  decodeItem(item, raw);
}


function decodeItem(item, raw) {
  const item_type = item.item_type;
  if (item_type == 'mime') {
    console.log('mime item');
    displayXML(raw);
  } else {
    displayUnknownItem(item_type, raw);
  }

}


function displayXML(raw) {
  const rawString = new TextDecoder().decode(raw);
  const prettyXML = xmlFormatter(rawString);
  document.getElementById('main-content').textContent = prettyXML;
}


/**
 * 
 * @param {*} buffer 
 * @returns {String}
 */
function arrayBufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0')) // Convert each byte to hex
    .join(' '); // Join bytes with spaces
}

function displayUnknownItem(item_type, raw) {
  let message = 'Unknown item type: ' + item_type;
  const hexData = arrayBufferToHex(raw);
  if (hexData.length < 1000) {
    message += '\n\nHexadecimal Data:\n' + hexData;
  }
  document.getElementById('main-content').textContent = message;
}



function setTreeListeners() {
  // Add event listeners to all toggle elements
  document.querySelectorAll('.tree .toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const childUl = toggle.nextElementSibling; // Find the sibling <ul>
      if (childUl) {
        childUl.classList.toggle('hidden'); // Show/hide child nodes
        toggle.classList.toggle('expanded'); // Toggle the arrow direction
      }
    });
  });


  // <div class="tree">
  //   <ul>
  //     <li>
  //       <span class="toggle">Parent 1</span>
  //       <ul class="hidden">
  //         <li>Child 1.1</li>
  //         <li>Child 1.2</li>
  //         <li>
  //           <span class="toggle">Child 1.3</span>
  //           <ul class="hidden">
  //             <li>Grandchild 1.3.1</li>
  //             <li>Grandchild 1.3.2</li>
  //           </ul>
  //         </li>
  //       </ul>
  //     </li>

  //     <li>
  //       <span class="toggle">Parent 2</span>
  //       <ul class="hidden">
  //         <li>Child 2.1</li>
  //         <li>Child 2.2</li>
  //       </ul>
  //     </li>
  //   </ul>
  // </div>
}