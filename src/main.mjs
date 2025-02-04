import { IsoFile } from '/src/IsoFile.mjs';
import { Gui } from '/src/IsoreGui.mjs';
import BoxDecoder from '/src/BoxDecoder.mjs';
import RawImage from '/src/RawImage.mjs';
import ImageSequence from './ImageSequence.mjs';


// File Variables

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
  g_isofile: null,


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
    Isore.g_isofile = new IsoFile(arrayBuffer);
  
    // Display Box Tree
    const tree = document.getElementById('box-tree');
    const boxTreeDump = document.getElementById('box-tree-dump');
    const mdatCanvas = document.getElementById('mdat-canvas');
    const mdatText = document.getElementById('mdat-text');
  
    // Create Callback
    const callback = Isore.createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas);
  
    Gui.displayBoxTree(Isore.g_isofile, tree, callback);
  
  },

  createBoxTreeListener(boxTreeDump, mdatText, mdatCanvas) {
    const boxTreeListener = function (box) {
      // Display Box
      Gui.displayBox(box, boxTreeDump);
  
      // Handle Box Data (if any)
      const data = Isore.g_isofile.getBoxData(box);
      if (!data) {
        // Do Nothing
      } else if (typeof data === 'string') {
        Gui.displayText(data, mdatText);
        Gui.hideContainer(mdatCanvas);
      } else if (data instanceof RawImage) {
        Isore.displayRawImage(data, mdatCanvas);
        Gui.hideContainer(mdatText);
      } else if (data instanceof ImageSequence) {
        Isore.displayImageSequence(data, mdatCanvas);
      }
    }
    return boxTreeListener;
  },

  displayImageSequence(sequence, container) {
    ImageSequence.must_be(sequence);
  
    const firstImage = sequence.images[0];
    const frameCount = sequence.images.length;
    htmlFrameCount.innerText = frameCount;
    Isore.displayRawImage(firstImage, container);      
    let imageIndex = 0;
    htmlFrameNumber.innerText = imageIndex + 1;
  
    function nextImage(delta) {
      imageIndex = (imageIndex + delta + frameCount) % frameCount;
      htmlFrameNumber.innerText = imageIndex + 1;
      const nextImage = sequence.images[imageIndex];
      Isore.displayRawImage(nextImage, container);
    }
  
    nextButton.onclick = () => nextImage(1);
    
    backButton.onclick = () => nextImage(-1);
  
    playButton.onclick = function () {
      // TODO
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