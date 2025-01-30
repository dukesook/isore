class Box {
  raw = null;       // ArrayBuffer - The entire Box, including the header & payload
  data = null;      // ArrayBuffer - Optional. mdat or idat data
  hdr_size = null;  // Number - The size of the header
  size = null;      // Number - The size as written in the file.
  start = null;     // Number - The start of the box in the file
  fourcc = null;    // String - The FourCC of the box
  uuid = null;      // String - Optional
}

export default Box;