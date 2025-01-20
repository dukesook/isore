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
    row.style.backgroundColor = 'grey';

    let header1 = document.createElement('th');
    header1.textContent = 'Item ID';
    row.appendChild(header1);

    let header2 = document.createElement('th');
    header2.textContent = 'Item Type';
    row.appendChild(header2);

    let header3 = document.createElement('th');
    header3.textContent = 'Item Name';
    row.appendChild(header3);

    itemsTable.appendChild(row);

    items.forEach((item) => {
      let row = itemsTable.insertRow();
      row.setAttribute('bgcolor', 'lightgrey');

      let idCell = row.insertCell();
      idCell.textContent = item.item_ID;

      let typeCell = row.insertCell();
      typeCell.textContent = item.item_type;

      let nameCell = row.insertCell();
      nameCell.textContent = item.item_name;

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
    headerRow.style.backgroundColor = 'grey';
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
      row.setAttribute('bgcolor', 'lightgrey');

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
    headerRow.style.backgroundColor = 'grey';

    const headers = ['Item ID', 'CM', 'Base Offset', 'Extent Offset', 'Extent Length'];
    headers.forEach((headerText) => {
      let header = document.createElement('th');
      header.textContent = headerText;
      headerRow.appendChild(header);
    });

    locationsTable.appendChild(headerRow);

    locations.forEach((location) => {
      let row = locationsTable.insertRow();
      row.setAttribute('bgcolor', 'lightgrey');

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
    headerRow.style.backgroundColor = 'grey';
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
      row.setAttribute('bgcolor', 'lightgrey');

      let idCell = row.insertCell();
      idCell.textContent = reference.from_item_ID;

      let typeCell = row.insertCell();
      typeCell.textContent = reference.type;

      let toIdsCell = row.insertCell();
      toIdsCell.textContent = reference.references.map((toId) => toId.to_item_ID).join(', ');
    });
  }
}