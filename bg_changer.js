import { DigitalAsset } from "./digital_asset.js";

//constants
const baseUrl = 'http://localhost:3000';
const reader = new FileReader();
const colors = {
  transparent: null,
  pink: 'rgb(255, 0, 255)',
  blue: 'rgb(0, 0, 255)',
  black: 'rgb(0, 0, 0)',
};
const requestedImages = {};

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
  selectedColor = null,
  loadingSpinner = null;

// functions
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function setColorFromURL() {
  let splitURL = window.location.href.split('/');
  let colorName = splitURL[splitURL.length - 1];
  colorName = colorName.split('-')[0];
  selectedColor = colors[colorName];
}

async function navigationProcess() {
  if(!authToken || authToken === 'null' || authToken === 'undefined') return;
  showElement(loadingSpinner);
  await createDigitalAsset();
  hideElement(loadingSpinner);
  window.location.href = createMediaEditorPath();
}

async function createDigitalAsset() {
  return new Promise(async (resolve, reject) => {
    digitalAsset = new DigitalAsset(fileField.files[0]);
    await digitalAsset.create(accountId.get(), authToken);
    resolve();
  }
  );
}

function createMediaEditorPath() {
  let path = `${baseUrl}/#/media-editor?digitalAsset_id=${digitalAsset.digitalAsset.id}`;
  return path;
}

function setRequestHeaders(request) {
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Access-Control-Allow-Origin", "*")
  return request;
}

function staticColorClickHandler(colorButton) {
  return () => {
    let colorName = Array.from(colorButton.classList).find(className => className.includes('is-'))?.split('-')[1];
    if (!colorName) return;
    selectedColor = colors[colorName];
    return;
  }
}

function addStyleListener(htmlElement) {
  var observer = new MutationObserver(debounce((mutations) => {
    mutations.forEach(function(mutationRecord) {
        selectedColor = mutationRecord.target.style.backgroundColor;
    });    
  }), 1000);

  observer.observe(htmlElement, { attributes : true, attributeFilter : ['style'] });
}

function parseColorButtons(colorButtons) {
  let colorButtonsArray = Array.from(colorButtons);
  colorButtonsArray.forEach(colorButton => {
    if (colorButton.classList.contains('is-color-picker')) {
      let colorSwatch = document.getElementById('colorSwatch');
      addStyleListener(colorSwatch);
    } else {
      colorButton.addEventListener('click', staticColorClickHandler(colorButton));
    }
  });
}
  
// requests
async function requestMaskedImage (base64File) {
  if (requestedImages[base64File + selectedColor]) return requestedImages[base64File + selectedColor];
  let processedBase64File = base64File.split(',')[0].indexOf('base64') >= 0 ? base64File.split(',')[1] : btoa(unescape(base64File.split(',')[1]));
  let imageRequest = {
    input: {
        image_base64: processedBase64File
    }
  }; 
  const resp = await AwsWafIntegration.fetch('https://6re1tbtl62.execute-api.us-west-1.amazonaws.com/cv-service/v1/background/remove',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(imageRequest)
            });
  if (!resp) return;
  var result = await resp.json();
  result = `data:image/png;base64,${result}`;
  requestedImages[base64File + selectedColor] = result;
  return result;
}

// auth portal

function receiveMessage(event) {
  if (event.origin !== baseUrl) return;
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
  let newWindow=window.open(`${baseUrl}/#/sign-in?external=true&redirect=/sign-in%3Fexternal=true`,'google window','width='+popupWinWidth+',height='+popupWinHeight+',top='+top+',left='+left);
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
  const sparkMD5Script = document.createElement('script');
  const awsWafIntegrationScript = document.createElement('script');
  sparkMD5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.2/spark-md5.min.js';
  awsWafIntegrationScript.src = "https://f56533acd8b9.us-west-1.captcha-sdk.awswaf.com/f56533acd8b9/jsapi.js";
  document.head.appendChild(sparkMD5Script);
  document.head.appendChild(awsWafIntegrationScript);
  const imgEl = document.getElementById('entry-point-image');
  const dropUploadArea = document.getElementById('drop-upload-area');
  const uploadWrapper = document.getElementsByClassName('entry-point_file-upload-content')[0];
  const imgElWrapper = document.getElementById('entry-point-image-wrapper');
  const mainCta = document.getElementById('btn');
  const colorButtons = document.getElementsByClassName('entry-point_color');
  const closeButton = document.getElementsByClassName('entry-point_image-close')[0];
  const lowResDownloadButton = document.getElementsByClassName('entry-point_dropdown-link')[0];
  const highResDownloadButton = document.getElementsByClassName('entry-point_dropdown-link')[1];
  loadingSpinner = document.getElementsByClassName('entry-point_lottie-wrap')[0];

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

  highResDownloadButton.addEventListener('click', () => {
    openAuthPortal();
  });

  closeButton.addEventListener('click', () => {
    hideElement(imgElWrapper);
    showElement(uploadWrapper);
    fileField.value = '';
  });

  fileField.addEventListener('change', function () {
    if (fileField.value == '') { return; }
    if (!['image/jpg', 'image/jpeg', 'image/png'].includes(fileField.files[0].type)) {
      alert('Please use a valid image');
      return;
    }
    reader.readAsDataURL(fileField.files[0]);
  });

  reader.addEventListener('load', async () => {
    imgEl.src = reader.result;
    showElement(loadingSpinner);
    let maskedImage = await requestMaskedImage(reader.result);
    imgEl.src = maskedImage;
    hideElement(loadingSpinner);
    hideElement(uploadWrapper);
    showElement(imgElWrapper);
  });

  imgEl.addEventListener('load', () => {
    lowResDownloadButton.href = imgEl.src;
  });

  parseColorButtons(colorButtons);
  setColorFromURL();
});
