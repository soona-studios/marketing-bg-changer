const baseUrl = 'http://localhost:3000';
const reader = new FileReader();
const selectedNetworks = [];
const flowBtnType = (window.screen.width < '720') * 1;
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
    getReservations(value);
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

let fileField = null,
  canvas = null,
  auth_token = null

function setRequestHeaders(request) {
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Access-Control-Allow-Origin", "*")
  request.setRequestHeader("X-SOONA-AUTH-PROVIDER", "soona_marketing")
  request.setRequestHeader("X-SOONA-PROVIDER-TOKEN", auth_token)
  return request;
}

function getReservations() {
  let request = new XMLHttpRequest();

  request.open('GET', `${baseUrl}/api/accounts/${accountId.get()}.json`);
  request = setRequestHeaders(request);
  
  request.onload = () => {
    console.log(request.responseText);
  };

  request.send();
}

function createDigitalAsset(accountId) {
  let request = new XMLHttpRequest();

  request.open('POST', `${baseUrl}/api/digital-assets`);
  request = setRequestHeaders(request);

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
  request = setRequestHeaders(request);

  request.onload = () => {
    if([200, 204].includes(request.status)) nextStepBtns[flowBtnType].click();
  }
  request.send(JSON.stringify({
    img: canvas.toDataURL(),
  }));
};

function receiveMessage(event) {
  if (event.origin !== "http://localhost:3000") return;
  let splitData = event.data.split(',');
  auth_token = splitData[1].split(':')[1];
  accountId.set(splitData[0].split(':')[1]);
  if (!accountId.get()) return;
}

function openAuthPortal() {
  newWindow=window.open('http://localhost:3000/#/auth-portal','google window','height=500,width=500');
  if (window.focus) {newWindow.focus()}
  // add event listener to receive message from auth portal
  window.addEventListener('message', receiveMessage, false);
}

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
const hideElement = el => el.classList.add('hidden');
const showElement = el => el.classList.remove('hidden');

const clickGetReservations = accountId => () => {
  getReservations(accountId);
}

document.addEventListener('DOMContentLoaded', function () {
  const imgEl = document.getElementById('entry-point-image');
  const dropUploadArea = document.getElementById('drop-upload-area');
  const testBtn = document.getElementById('test-button');
  openAuthPortal();
  
  fileField = document.querySelector('input[type=file]');
  canvas = document.getElementById('tool-canvas');
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

  testBtn.addEventListener('click', clickGetReservations(accountId.get()));

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
  });

  imgEl.addEventListener('load', () => {
    hideElement(dropUploadArea);
  });
});
