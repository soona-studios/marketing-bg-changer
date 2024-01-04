import { DigitalAsset } from "./digital_asset.js";
const baseUrl = 'http://localhost:3000';
const reader = new FileReader();

// reactive objects
const accountId = {
  value: null,
  set(value) {
    this.value = value;
    this.valueListener(value);
  },
  get() {
    return this.value;
  },
  valueListener(value) {},
  addValueListener: function (listener) {
    this.valueListener = listener;
  },
};

accountId.addValueListener(value => {
  if (!value) return;
  else {
    navigationProcess();
  }
});


// variables
let fileField = null,
  authToken = null,
  digitalAsset = null,
  selectedColor

// functions
function navigationProcess() {
  if(!authToken || authToken === 'null' || authToken === 'undefined') return;
  createDigitalAsset();
  //let path = createMediaEditorPath();
  //window.location.href = path;
}

function createDigitalAsset() {
  digitalAsset = new DigitalAsset(fileField.files[0]);
  digitalAsset.create(accountId.get(), authToken);
}

function createMediaEditorPath() {
  let path = `${baseUrl}/media-editor?digitalAsset_id=${digitalAsset.digitalAsset.id}`;
  return path;
}

function setRequestHeaders(request) {
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Access-Control-Allow-Origin", "*")
  return request;
}

// requests
function requestMaskedImage (base64File) {
  let request = new XMLHttpRequest();
  request.open('POST', `https://cv.ml.soona.dev/v2/background/remove`);

  request.onload = () => {
    console.log(request.response);
  }
  request.send(JSON.stringify({
    input: {
      image_base64: base64File,
    }
  }));
}

// auth portal

function receiveMessage(event) {
  if (event.origin !== "http://localhost:3000") return;
  let splitData = event.data.split(',');
  authToken = splitData[1].split(':')[1];
  accountId.set(splitData[0].split(':')[1]);
  if (!accountId.get()) return;
}

function openAuthPortal() {
  let popupWinWidth = 500;
  let popupWinHeight = 600;
  let left = (window.screen.width / 2) - (popupWinWidth / 2);
  let top = (window.screen.height / 2) - (popupWinHeight / 1.5);
  let newWindow=window.open('http://localhost:3000/#/sign-in?external=true&redirect=/sign-in%3Fexternal=true','google window','width='+popupWinWidth+',height='+popupWinHeight+',top='+top+',left='+left);
  if (window.focus) {newWindow.focus()}
  // add event listener to receive message from auth portal
  window.addEventListener('message', receiveMessage, false);
}


// drag and drop image code
const handleDrop = () => {
  return e => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 1) {
      alert('Please upload only one image');
      return;
    }

    if (!['image/jpg', 'image/jpeg', 'image/png'].includes(files[0].type)) {
      alert('Please use a valid image');
      return;
    }

    reader.readAsDataURL(files[0]);
  }
};

const preventDefaults = e => {
  e.preventDefault();
  e.stopPropagation();
};

const highlight = el => () => el.classList.add('highlight');
const unhighlight = el => () => el.classList.remove('highlight');
const hideElement = el => el.classList.add('hide');
const showElement = el => el.classList.remove('hide');

document.addEventListener('DOMContentLoaded', function () {
  const imgEl = document.getElementById('entry-point-image');
  const dropUploadArea = document.getElementById('drop-upload-area');
  const imgElWrapper = document.getElementById('entry-point-image-wrapper');
  const mainCta = document.getElementById('btn');
  
  fileField = document.querySelector('input[type=file]');
  

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropUploadArea.addEventListener(eventName, preventDefaults, false)
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropUploadArea.addEventListener(eventName, highlight(dropUploadArea), false)
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropUploadArea.addEventListener(eventName, unhighlight(dropUploadArea), false)
  });

  dropUploadArea.addEventListener('drop', handleDrop(fileField), false);

  mainCta.addEventListener('click', () => {
    openAuthPortal();
  });

  fileField.addEventListener('change', function () {
    if (fileField.value == '') { return; }
    if (!['image/jpg', 'image/jpeg', 'image/png'].includes(fileField.files[0].type)) {
      alert('Please use a valid image');
      return;
    }

    reader.readAsDataURL(fileField.files[0]);
  });

  reader.addEventListener('load', () => {
    imgEl.src = reader.result;
    requestMaskedImage(reader.result);
    hideElement(dropUploadArea);
    showElement(imgElWrapper);
  });
});
