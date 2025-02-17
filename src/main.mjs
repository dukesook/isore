import IsoFile from './IsoFile.mjs';
import Gui from './IsoreGui.mjs';
import RawImage from './RawImage.mjs';
import ImageSequence from './ImageSequence.mjs';
import BoxHandler from './BoxHandler.mjs';
import ImageGrid from './ImageGrid.mjs';
import Utility from './Utility.mjs';
import Box from './Box.mjs';

// HTML Elements
const fileInput = document.getElementById('file-input');
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const htmlFrameNumber = document.getElementById('current-frame-number');
const htmlFrameCount = document.getElementById('frame-count');
const htmlImageWidth = document.getElementById('image-width');
const htmlImageHeight = document.getElementById('image-height');

export const Isore = {
  isoFile: null,

  reset() {
    Gui.reset();
    htmlFrameCount.innerText = 0;
    htmlFrameNumber.innerText = 0;
    htmlImageWidth.innerText = 0;
    htmlImageHeight.innerText = 0;
  },

  loadLocalFile(file, successCallback, errCallback) {
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
  },

  loadFile(arrayBuffer) {

    Isore.reset();

    // Create IsoFile object
    Isore.isoFile = new IsoFile(arrayBuffer);
  
    // Display Box Tree
    const tree = document.getElementById('box-tree');
    const boxTreeDump = document.getElementById('box-dump');
    const mdatCanvas = document.getElementById('mdat-canvas');
    const mdatText = document.getElementById('mdat-text');
  
    // Create Callback
    const onclickBox = createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas);
  
    Gui.displayBoxTree(Isore.isoFile, tree, onclickBox);
  
    // Display Default
    const defaultBox = Isore.getDefaultBox(Isore.isoFile);
    if (defaultBox) {
      onclickBox(defaultBox);
    }
  },

  displayData(data, container, mdatText) {
    Utility.must_be(container, HTMLElement);

    // Display
    if (!data) {
      return;
    } if (typeof data === 'string') {
      Gui.displayText(data, mdatText);
      Gui.hideContainer(container);
    }
    else if (data instanceof RawImage) {
      Isore.displayRawImage(data, container);
      Gui.hideContainer(mdatText);
    }
    else if (data instanceof ImageSequence) {
      Isore.displayImageSequence(data, container);
    }
    else if (data instanceof ImageGrid) {
      Gui.displayImageGrid(data, container);
    }
    else if (data instanceof ImageData) {
      Gui.displayImageData(data, container);
    }
    else {
      console.log('Unhandled data type:', data);
    }
    
  },

  displayImageSequence(sequence, container) {
    ImageSequence.must_be(sequence);
  
    const firstImage = sequence.images[0];
    const frameCount = sequence.images.length;
    htmlFrameCount.innerText = frameCount;
    Isore.displayRawImage(firstImage, container);      
    let imageIndex = 0;
    htmlFrameNumber.innerText = imageIndex + 1;
    let playing = false;

    function nextImage(delta) {
      imageIndex = (imageIndex + delta + frameCount) % frameCount;
      htmlFrameNumber.innerText = imageIndex + 1;
      const nextImage = sequence.images[imageIndex];
      Isore.displayRawImage(nextImage, container);
    }

    function renderNext() {
      if (!playing) {
        return;
      }
      nextImage(1);
      setTimeout(renderNext, 800);
    }
  
    nextButton.onclick = () => nextImage(1);
    
    backButton.onclick = () => nextImage(-1);
  
    playButton.onclick = function beginPlay() {
      if (playing) {
        return;
      }
      playing = true;
      renderNext();

    }

    pauseButton.onclick = function pause() {
      playing = false;
    }
  
  },

  displayRawImage(image, container) {
    RawImage.must_be(image);
    htmlImageWidth.innerText = image.width;
    htmlImageHeight.innerText = image.height;
    Gui.displayRawImage(image, container);
  },

  getDefaultBox(isoFile) {
    Utility.must_be(isoFile, IsoFile);

    for (let box of isoFile.boxes) {
      if (box.fourcc === 'moov') {
        const trak = box.get_child('trak');
        return trak;
      }
      else if (box.fourcc === 'meta') {
        const pitm = box.get_child('pitm');
        console.log('pitm: ', pitm);
        const id = pitm.item_id; console.log('WARNING: pitm mismatch: item_ID vs item_id');
        const iinf = box.get_child('iinf');
        const items = iinf.children;
        for (const item of items) {
          if (item.item_ID === id) {
            return item;
          }
        }
      }
    }

  }

}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    Isore.loadLocalFile(file, Isore.loadFile, console.log);
  }
});




document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

});

function createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas) {
  Utility.must_be(boxTreeDump, HTMLElement);
  Utility.must_be(mdatText, HTMLElement);
  Utility.must_be(mdatCanvas, HTMLCanvasElement);

  const boxTreeListener = function (box) {
    Utility.must_be(box, Box);

    // Display Box
    Gui.displayBox(box, boxTreeDump);

    
    const data = BoxHandler.getBoxData(Isore.isoFile, box);
    Isore.displayData(data, mdatCanvas, mdatText);


  }
  return boxTreeListener;
}