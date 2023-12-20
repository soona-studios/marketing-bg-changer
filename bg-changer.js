const baseUrl = 'http://localhost:3000';
const reader = new FileReader();
const selectedNetworks = [];
const flowBtnType = (window.screen.width < '720') * 1;

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
    createDigitalAsset(value);
  }
});

const digitalAssetId = {
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

// variables
let fileField = null,
  auth_token = null

// requests
function setRequestHeaders(request, authenticated=true) {
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Access-Control-Allow-Origin", "*")
  if (authenticated) {
    request.setRequestHeader("X-SOONA-AUTH-PROVIDER", "soona_marketing")
    request.setRequestHeader("X-SOONA-PROVIDER-TOKEN", auth_token)
  }
  return request;
}

function createDigitalAsset(accountId) {
  let request = new XMLHttpRequest();

  request.open('POST', `${baseUrl}/api/accounts/${accountId}/digital-assets`);
  request = setRequestHeaders(request);
  request.withCredentials = true;

  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      const response = JSON.parse(request.responseText);
      digitalAssetId.set(response.id);
    } else {
      console.log('error');
    }
  };

  request.send(JSON.stringify({
    accountId: accountId,
    name: 'test',
    description: 'test',
    type: 'image',
  }));
}

function requestMaskedImage () {
  let request = new XMLHttpRequest();

  request.open('POST', `${baseUrl}/api/eventing/subscribe`);
  request = setRequestHeaders(request, false);

  request.onload = () => {
    if([200, 204].includes(request.status)) nextStepBtns[flowBtnType].click();
  }
  request.send(JSON.stringify({
    img: canvas.toDataURL(),
  }));
};

// auth portal

function receiveMessage(event) {
  if (event.origin !== "http://localhost:3000") return;
  let splitData = event.data.split(',');
  auth_token = splitData[1].split(':')[1];
  accountId.set(splitData[0].split(':')[1]);
  if (!accountId.get()) return;
}

function openAuthPortal() {
  let popupWinWidth = 500;
  let popupWinHeight = 500;
  let left = (window.screen.width / 2) - (popupWinWidth / 2);
  let top = (window.screen.height / 2) - (popupWinHeight / 1.5);
  newWindow=window.open('http://localhost:3000/#/sign-in?external=true&redirect=/sign-in%3Fexternal=true','google window','width='+popupWinWidth+',height='+popupWinHeight+',top='+top+',left='+left);
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
  //const testBtn = document.getElementById('test-button');
  openAuthPortal();
  
  fileField = document.querySelector('input[type=file]');
  downloadsList = document.getElementById('downloads-list');
  

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
    hideElement(dropUploadArea);
    showElement(imgElWrapper);
  });
});
