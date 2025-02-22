import Box from './Box.mjs';
import ImageGrid from './ImageGrid.mjs';
import ImageSequence from './ImageSequence.mjs';
import IsoFile from './IsoFile.mjs';
import RawImage from './RawImage.mjs';
import Utility from './Utility.mjs';

export const Gui = {

  reset() {

  },

  /**
   * Displays a list of items on the table.
   *
   * @param {Array} items - An array of item objects to be displayed.
   *                        Generated from MP4Box's ISOFile.meta.iinf.item_infos
   * @param {HTMLTableElement} itemsTable - The HTMLtable element where the items will be displayed.
   */
  displayItemsOnTable(items, itemsTable, eventListener = null) {
    Utility.must_be(items, Array);
    Utility.must_be(itemsTable, HTMLElement);

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
    Utility.must_be(properties, Array);
    Utility.must_be(propertiesTable, HTMLElement);

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
    Utility.must_be(locations, Array);
    Utility.must_be(locationsTable, HTMLElement);

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
    Utility.must_be(references, Array);
    Utility.must_be(referencesTable, HTMLElement);

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

  displayRawImage(rawImage, container) {
    RawImage.must_be(rawImage);
    Utility.must_be(container, HTMLCanvasElement);
    container.style.display = 'block';
    container.width = rawImage.width;
    container.height = rawImage.height;
    RawImage.displayOnCanvas(rawImage, container);
  },

  displayImageData(imageData, canvas) {
    Utility.must_be(imageData, ImageData);
    Utility.must_be(canvas, HTMLCanvasElement);
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
  },


  displayImageSequence(imageSequence, container) {
    ImageSequence.must_be(imageSequence);
    Utility.must_be(container, HTMLElement);
    container.style.display = 'block';
  },

  displayImageGrid(imageGrid, canvas) {
    Utility.must_be(imageGrid, ImageGrid);
    Utility.must_be(canvas, HTMLElement);
    if (canvas.tagName != 'CANVAS') {
      throw Error('container must be a canvas');
    }

    canvas.width = imageGrid.gridWidth;
    canvas.height = imageGrid.gridHeight;    

    for (let row = 0; row < imageGrid.rows; row++) {
      for (let col = 0; col < imageGrid.columns; col++) {
        const rawImage = imageGrid.rawImages[row][col];
        const dx = col * imageGrid.tileWidth;
        const dy = row * imageGrid.tileHeight;
        RawImage.displayOnCanvas(rawImage, canvas, dx, dy);
      }
    }

    console.log('imageGrid:', imageGrid);
    console.log('WIP: displayImageGrid()');

  },

  /**
   * 
   * @param {*} box 
   * @param {*} container  HTML Element
   */
  displayBox(box, container) {
    Box.must_be(box);
    Utility.must_be(container, HTMLElement);
    
    // Clear Previous Content
    container.innerHTML = '';

    // Create Table
    const table = document.createElement('table');
    container.appendChild(table);

    const entries = Object.entries(box);
    entries.forEach(([key, value]) => {

      if (typeof value == 'object') {
        // You don't know how to display objects
        return;
      }

      const displayIfExists = ['data', 'uuid', 'item_ID']
      if (displayIfExists.includes(key) && !value) {
        return;
      }


      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      keyCell.textContent = key;
      const valueCell = document.createElement('td');
      valueCell.textContent = value;
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });


  },

  hideContainer(container) {
    Utility.must_be(container, HTMLElement);

    container.style.display = 'none';
  },

  displayText(string, container) {
    Utility.must_be(string, String);
    Utility.must_be(container, HTMLElement);
    container.innerHTML = '';
    container.style.display = 'block';
    let pre = document.createElement('pre');
    container.appendChild(pre);
    pre.textContent = string;
  },


  /**
   * 
   * @param {Box} box 
   * @param {*} tree 
   * @param {function(box; *, output: *)} listener 
   */
  addBoxToTree(box, tree, onclickBox) {
    Box.must_be(box);
    Utility.must_be(tree, HTMLElement);
    Utility.must_be_function(onclickBox);

    let children = box.children;
    let displayName = box.fourcc;
  
    if (box.fourcc == 'infe') {
      displayName = box.fourcc + ' - ' + box.item_type;
    }
  
    const boxElement = document.createElement('li');
    boxElement.textContent = displayName;
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


  displayBoxTree(isoFile, tree, onclickBox) {
    Utility.must_be(isoFile, IsoFile);
    Utility.must_be(tree, HTMLElement);
    Utility.must_be_function(onclickBox);

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
    makeTreeExpandable();
  },

}

export default Gui;

// Private Functions

function makeTreeExpandable() {
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
}

function displayIrefItems(iref, container) {
  Box.must_be(iref, 'iref');
  Utility.must_be(container, HTMLElement);



}