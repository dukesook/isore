import { Parser } from './Parser.mjs';
import { printDimensions, exploreLibheif } from './libs/LibHeif.mjs';
import Utility from './Utility.mjs';

export class IsoFile {
  raw = null; // ArrayBuffer of the entire ISO file.
  boxes = null; // Array of Boxes

  constructor(rawIn) {
    Utility.must_be(rawIn, ArrayBuffer);

    this.raw = rawIn;
    this.boxes = Parser.parseIsoFile(rawIn);
    this.debugLibheif(rawIn);
  }

  debugLibheif(arrayBufer) {
    // exploreLibheif(arrayBufer);
    // printDimensions(arrayBufer);
  }

}

export default IsoFile;
