const baseUrl = 'https://book.soona.co';
const reader = new FileReader();
const selectedNetworks = [];
const flowBtnType = (window.screen.width < '720') * 1;

let selectedImageIndex = 0,
  zip = null,
  fileField = null,
  canvas = null

const requestMaskedImage = () => {
  const request = new XMLHttpRequest();

  request.open('POST', `${baseUrl}/api/eventing/subscribe`);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");

  request.onload = () => {
    if([200, 204].includes(request.status)) nextStepBtns[flowBtnType].click();
  }
  request.send(JSON.stringify({
    img: canvas.toDataURL(),
  }));
};

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

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  const imgEl = document.createElement('img');
  const dropUploadArea = document.getElementById('drop-upload-area');
  
  fileField = form.querySelector('input[type=file]');
  canvas = document.querySelector('canvas');
  canvas.width = 0;
  canvas.height = 0;
  downloadsList = document.getElementById('downloads-list');
  
  const ctx = canvas.getContext('2d');

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

  form.addEventListener('submit', e => {
    e.preventDefault();
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
  });

  imgEl.addEventListener('load', () => {
    hideElement(dropUploadArea);
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  });
});
