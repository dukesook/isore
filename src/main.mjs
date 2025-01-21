import { Parser } from '/src/Parser.mjs';
import { Gui } from '/src/IsoreGui.mjs';

// File Variables
let isofile = null

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
  let mp4boxfile = Parser.parseIsoFile(arrayBuffer); // MP4BoxFile
  isofile = mp4boxfile
  console.log('typeof mp4boxfile', typeof mp4boxfile)
  console.log('mp4boxfile', mp4boxfile)
  let meta = isofile.meta;

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

function getItemById(id) {
  console.log(isofile)
  const meta = isofile.meta;
  const locations = meta.iloc.items;
  const mdat = isofile.mdats[0];
  console.log('mdat', mdat)
  
  console.log(mdat); // Outputs the full object to the console
  console.log(Object.keys(mdat)); // Lists the keys (properties) of the object
  console.log(Object.getPrototypeOf(mdat)); // Displays the object's prototype



}

function onClickedItem(item) {
  console.log('clicked item', item);
  const id = item.item_ID;
  console.log(id)
  let data = getItemById(id);
  // console.log('item data', data)
}
