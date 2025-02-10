class Box {
  fourcc = null;    // String - The FourCC of the box
  hdr_size = null;  // Number - The size of the header
  size = null;      // Number - The size as written in the file.
  start = null;     // Number - The start of the box in the file
  data = null;      // ArrayBuffer - Optional. mdat or idat data
  raw = null;       // ArrayBuffer - The entire Box, including the header & payload
  uuid = null;      // String - Optional
  children = [];    // Array - Optional. Contains child boxes
  parent = null;    // Box - Optional. Root Boxes don't have a parent
  item_ID = null;   // Number - Optional. For 'infe' boxes

  static must_be(object, type = null) {
    if (!(object instanceof Box)) {
      throw new Error('Expected a Box object but got: ' + typeof object);
    }

    if (type && object.fourcc != type) {
      throw new Error('Expected a ' + type + ' box but got: ' + object.fourcc);
    }
  }

  get_child(fourcc) {
    return this.children.find((child) => child.fourcc == fourcc);
  }

  static getItemPropertyAssociations(ipma, id) {
    Box.must_be(ipma);
    const associations = ipma.associations;
  
    for (const association of associations) {
      if (id === association.id) {
        return association.props; // Returns immediately when found
      }
    }
  
    return null; // If no matching association is found
  }
  

  static getItemProperties(item) {
    Box.must_be(item);
    const properties = [];
    const id = item.item_ID;

    const iinf = item.parent;
    const meta = iinf.parent;
    const iprp = meta.get_child('iprp');
    const ipco = iprp.get_child('ipco');
    const ipma = iprp.get_child('ipma');
    const associations = Box.getItemPropertyAssociations(ipma, id);

    for (const association of associations) {
      const propertyIndex = association.property_index - 1;
      const property = ipco.children[propertyIndex];
      properties.push(property);
    }
    return properties;

  }

} // Class Box

export default Box;