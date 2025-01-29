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
  Gui.displayBoxTree(g_isofile);
  let meta = g_isofile.meta;

  const items = meta.iinf.item_infos;
  let itemsTable = document.getElementById('items-table');
  Gui.displayItemsOnTable(items, itemsTable, Gui.displayItem);

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
