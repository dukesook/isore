import { IsoFile } from '/src/IsoFile.mjs';
import { Gui } from '/src/IsoreGui.mjs';
import vkbeautify from 'vkbeautify'; // npm install vkbeautify

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
  let meta = g_isofile.meta;

  const items = meta.iinf.item_infos;
  let itemsTable = document.getElementById('items-table');
  Gui.displayItemsOnTable(items, itemsTable, onClickedItem);

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


function onClickedItem(item) {
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
  
  // Parse the XML string into a DOM object
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rawString, "application/xml");

  // Serialize the DOM object into a pretty-printed XML string
  const serializer = new XMLSerializer();
  const prettyXML = vkbeautify.xml(serializer.serializeToString(xmlDoc)); // Use a library for beautification
  
  // Display XML
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
