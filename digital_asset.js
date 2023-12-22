import { FileChecksum } from "./file_checksum.js";
import { SoonaRequest } from "./soona_request.js";

export class DigitalAsset {
  constructor(file) {
    this.file = file;
    this.checksum = null;
    this.direct_upload_signed_id = null;
    this.direct_upload_blob = null;
    this.auth_token = null;
    this.status = { value: null, message: null };
    this.digital_asset = null;
  }

  async create(account_id, auth_token) {
    this.auth_token = auth_token;
    this.account_id = account_id;
    return this.createDirectUpload()
      .then(() => this.createAmazonS3Image())
      .then(() => this.createDigitalAsset())
      .catch((error) => {
        console.log(error);
      });
  }

  createDirectUpload() {
    return new Promise((resolve, reject) => {
      let onload = (request) => {
        if (request.status >= 200 && request.status < 400) {
          const response = JSON.parse(request.responseText);
          this.direct_upload_blob = response;
          this.direct_upload_signed_id = response.signed_id;
          this.updateStatus('success', 'Direct upload created');
          resolve(); // Resolve the promise when direct upload is created
        } else {
          this.updateStatus('error', 'Error creating direct upload');
          reject('Error creating direct upload');
        }
      };

      FileChecksum.create(this.file, async (error, checksum) => {
        if (error) {
          reject(error);
          return;
        }

        let soonaRequest = new SoonaRequest(
          'POST',
          'api/direct_uploads/create',
          this.auth_token,
          JSON.stringify({
            blob: {
              filename: this.file.name,
              byte_size: this.file.size,
              checksum: checksum,
              content_type: this.file.type,
            },
          }),
          onload.bind(this),
          false
        );
        await soonaRequest.send();
      });
    });
  }

  createAmazonS3Image() {
    return new Promise((resolve, reject) => {
      const onload = (request) => {
        if (request.status >= 200 && request.status < 400) {
          this.updateStatus('success', 'Amazon S3 image created');
          resolve(); // Resolve the promise when Amazon S3 image is created
        } else {
          this.updateStatus('error', 'Error creating Amazon S3 image');
          reject('Error creating Amazon S3 image');
        }
      };
  
      const request = new XMLHttpRequest();
      request.open('PUT', this.direct_upload_blob.direct_upload.url);
      
      for (const header in this.direct_upload_blob.direct_upload.headers) {
        request.setRequestHeader(header, this.direct_upload_blob.direct_upload.headers[header]);
      }
  
      // Use asynchronous request and handle onload in the callback
      request.onload = () => onload(request);
  
      request.send(this.file.slice());
    });
  }

  createDigitalAsset() {
    return new Promise((resolve, reject) => {
      let onload = (request) => {
        if (request.status >= 200 && request.status < 400) {
          this.updateStatus('success', 'Digital asset created');
          resolve(); // Resolve the promise when digital asset is created
        } else {
          this.updateStatus('error', 'Error creating digital asset');
          reject('Error creating digital asset');
        }
      };

      let soonaRequest = new SoonaRequest(
        'POST',
        `api/accounts/${this.account_id}/digital_assets`,
        this.auth_token,
        JSON.stringify({
          digital_asset: {
            title: this.file.name,
            visibility: 0,
            origin: 1,
            origin_source: 1,
            ownership: 1,
            media_type: 0,
            file: this.direct_upload_signed_id,
          },
        }),
        onload.bind(this),
        false
      );
      soonaRequest.send();
    });
  }

  updateStatus(value, message) {
    console.log(message);
    this.status.value = value;
    this.status.message = message;
  }
}