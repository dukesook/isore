import Box from './Box.mjs';

//TODO - move xmlFormatter out of gui code!!
import xmlFormatter from 'xml-formatter'; // npm install xml-formatter

export const Gui = {
  /**
   * Displays a list of items on the table.
   *
   * @param {Array} items - An array of item objects to be displayed.
   *                        Generated from MP4Box's ISOFile.meta.iinf.item_infos
   * @param {HTMLTableElement} itemsTable - The HTMLtable element where the items will be displayed.
   */
  displayItemsOnTable(items, itemsTable, eventListener = null) {
    if (!itemsTable) {
      console.error('itemsTable is null');
      return;
    }

    itemsTable.innerHTML = '';

    let caption = document.createElement('caption');
    caption.textContent = 'Items';
    itemsTable.appendChild(caption);

    let row = document.createElement('tr');
    itemsTable.appendChild(row);

    // Add Headers
    const headers = ['Item ID', 'Item Type', 'Item Name', 'Content Type'];
    headers.forEach((headerText) => {
      let header = document.createElement('th');
      header.textContent = headerText;
      row.appendChild(header);
    });

    items.forEach((item) => {
      let row = itemsTable.insertRow();

      let idCell = row.insertCell();
      idCell.textContent = item.item_ID;

      let typeCell = row.insertCell();
      typeCell.textContent = item.item_type;

      let nameCell = row.insertCell();
      nameCell.textContent = item.item_name;

      let contentCell = row.insertCell();
      contentCell.textContent = item.content_type;

      if (eventListener) {
        row.addEventListener('click', () => {
          eventListener(item);
        });
      }
    });
  },

  /**
   * Displays a list of items on the table.
   *
   * @param {Array} properties - An array of property objects to be displayed.
   *                             Generated from MP4Box's ISOFile.meta.iprp.ipco.boxes
   * @param {HTMLTableElement} propertiesTable - The HTMLtable element where the items will be displayed.
   */
  displayPropertiesOnTable(properties, propertiesTable) {
    propertiesTable.innerHTML = '';

    // Add Title
    let caption = document.createElement('caption');
    caption.textContent = 'Properties';
    propertiesTable.appendChild(caption);

    // Add Headers
    let headerRow = document.createElement('tr');
    const headers = ['Index', 'Property Type'];
    headers.forEach((headerText) => {
      let header = document.createElement('th');
      header.textContent = headerText;
      headerRow.appendChild(header);
    });
    propertiesTable.appendChild(headerRow);

    // Add Properties
    properties.forEach((property, index) => {
      let row = propertiesTable.insertRow();

      let indexCell = row.insertCell();
      indexCell.textContent = index + 1;

      let fourccCell = row.insertCell();
      fourccCell.textContent = property.type;
    });
  },

  /**
   * Displays a list of items on the table.
   *
   * @param {Array} locations - An array of property objects to be displayed.
   *                            Generated from MP4Box's ISOFile.meta.iloc.items
   * @param {HTMLTableElement} locationsTable - The HTMLtable element where the items will be displayed.
   */
  displayItemLocations(locations, locationsTable) {
    locationsTable.innerHTML = '';

    let caption = document.createElement('caption');
    caption.textContent = 'Item Locations';
    locationsTable.appendChild(caption);

    let headerRow = document.createElement('tr');

    const headers = ['Item ID', 'CM', 'Base Offset', 'Extent Offset', 'Extent Length'];
    headers.forEach((headerText) => {
      let header = document.createElement('th');
      header.textContent = headerText;
      headerRow.appendChild(header);
    });

    locationsTable.appendChild(headerRow);

    locations.forEach((location) => {
      let row = locationsTable.insertRow();

      let idCell = row.insertCell();
      idCell.textContent = location.item_ID;

      let constructionMethodCell = row.insertCell();
      constructionMethodCell.textContent = location.construction_method;

      let baseOffsetCell = row.insertCell();
      baseOffsetCell.textContent = location.base_offset;

      let extent = location.extents[0];

      let extentOffsetCell = row.insertCell();
      extentOffsetCell.textContent = extent.extent_offset;

      let extentLengthCell = row.insertCell();
      extentLengthCell.textContent = extent.extent_length;

      location.item_id;
      location.construction_method;
      location.base_offset;
      location.extent_length;
      location.extent_offset;
    });
  },

  /**
   *
   * @param {Array} references - Array of references objects to be displayed.
   * - references.from_item_ID: The ID of the item that references other items.
   * - references.type: The type of reference (dimg, cdsc, etc).
   * - references.references: Array of objects that contain the ID of the item being referenced.
   * - references.references[0].to_item_ID: The first item ID that is being referenced.
   * @param {HTMLTableElement} referencesTable
   */
  displayReferencesOnTable(references, referencesTable) {
    referencesTable.innerHTML = '';

    // Add Title
    let caption = document.createElement('caption');
    caption.textContent = 'Item References';
    referencesTable.appendChild(caption);

    // Add Headers
    let headerRow = document.createElement('tr');
    const headers = ['Item ID', 'Type', 'To IDs'];
    headers.forEach((headerText) => {
      let header = document.createElement('th');
      header.textContent = headerText;
      headerRow.appendChild(header);
    });
    referencesTable.appendChild(headerRow);

    // Add References
    references.forEach((reference) => {
      let row = referencesTable.insertRow();

      let idCell = row.insertCell();
      idCell.textContent = reference.from_item_ID;

      let typeCell = row.insertCell();
      typeCell.textContent = reference.type;

      let toIdsCell = row.insertCell();
      toIdsCell.textContent = reference.references.map((toId) => toId.to_item_ID).join(', ');
    });
  },

  /**
   * 
   * @param {*} box 
   * @param {*} container  HTML Element
   */
  displayBox(box, container, raw = null) {
    
    // Clear Previous Content
    container.innerHTML = '';

    // Create Table
    const table = document.createElement('table');
    container.appendChild(table);

    Object.entries(box).forEach(([key, value]) => {
      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      keyCell.textContent = key;
      const valueCell = document.createElement('td');
      valueCell.textContent = value;
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });

    if (raw) {
      let pre = document.createElement('pre');
      container.appendChild(pre);
      pre.textContent = Gui.decodeItem(box, raw);
    }
  },

  decodeItem(item, raw) {
    // TODO: decodeItem doesn't belong in Gui
    // Move it to a new file
    const item_type = item.item_type;
    if (item_type == 'mime') {
      const rawString = new TextDecoder().decode(raw);
      const prettyXML = xmlFormatter(rawString);
      return prettyXML;
    } else {
      throw Error('Unknown item type: ' + item_type);
    }
  },

  /**
   * @param {*} buffer 
   * @returns {String}
   */
  arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0')) // Convert each byte to hex
      .join(' '); // Join bytes with spaces
  },


  /**
   * 
   * @param {Box} box 
   * @param {*} tree 
   * @param {function(box; *, output: *)} listener 
   */
  addBoxToTree(box, tree, onclickBox) {
    if (!(box instanceof Box)) {
      throw new Error('addBoxToTree() expects a Box object but got: ' + typeof box);
    }

    const fourcc = box.fourcc
    let children = box.children;

    // if (fourcc == 'iinf') {
      // children = box.item_infos;
    // }
  
    const boxElement = document.createElement('li');
    boxElement.textContent = fourcc; // box.type == 4cc
    tree.appendChild(boxElement);

    // Add Event Listener to li
    boxElement.addEventListener('click', () => onclickBox(box));

    // Add Children
    if (children.length > 0) {
      boxElement.classList.add('toggle');
      const childContainer = document.createElement('ul');
      childContainer.classList.add('hidden');
      tree.appendChild(childContainer);
      children.forEach((childBox) => {
        Gui.addBoxToTree(childBox, childContainer, onclickBox);
      });
    }
  },

  makeTreeExpandable() {
    // TODO: Combine with addBoxToTree() - when you add a single box, then make it expandable
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
  },

  /**
   * @param {IsoFile} isoFile 
   * @param {HTMLElement} tree
   * @param 
   */
  displayBoxTree(isoFile, tree, onclickBox) {
    // Clear Previous Content
    tree.innerHTML = '';
    
    // Create Root
    const root = document.createElement('ul');
    tree.appendChild(root);
    
    // Add File-Level Boxes
    isoFile.boxes.forEach((box) => {
      Gui.addBoxToTree(box, root, onclickBox);
    })

    // TODO: Combine with addBoxToTree()
    Gui.makeTreeExpandable();
  },

}