class Box {
  fourcc = null;    // String - The FourCC of the box
  raw = null;       // ArrayBuffer - The entire Box, including the header & payload
  data = null;      // ArrayBuffer - Optional. mdat or idat data
  hdr_size = null;  // Number - The size of the header
  size = null;      // Number - The size as written in the file.
  start = null;     // Number - The start of the box in the file
  uuid = null;      // String - Optional
  children = [];    // Array - Optional. Contains child boxes
  parent = null;    // Box - Optional. Root Boxes don't have a parent
}

export default Box;