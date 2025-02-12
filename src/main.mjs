import IsoFile from './IsoFile.mjs';
import Gui from './IsoreGui.mjs';
import RawImage from './RawImage.mjs';
import ImageSequence from './ImageSequence.mjs';
import BoxHandler from './BoxHandler.mjs';
import ImageGrid from './ImageGrid.mjs';
import Utility from './Utility.mjs';

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
  isofile: null,

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
    // Create IsoFile object
    Isore.isofile = new IsoFile(arrayBuffer);
  
    // Display Box Tree
    const tree = document.getElementById('box-tree');
    const boxTreeDump = document.getElementById('box-tree-dump');
    const mdatCanvas = document.getElementById('mdat-canvas');
    const mdatText = document.getElementById('mdat-text');
  
    // Create Callback
    const callback = Isore.createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas);
  
    Gui.displayBoxTree(Isore.isofile, tree, callback);
  
  },

  createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas) {
    const boxTreeListener = function (box) {
      // Display Box
      Gui.displayBox(box, boxTreeDump);

      
      const data = BoxHandler.decode(box, raw);
      Isore.displayData(data, mdatCanvas);
      const raw = Isore.isofile.getBoxData(box);


    }
    return boxTreeListener;
  },

  displayData(data, container) {
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