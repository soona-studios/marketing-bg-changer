export class SoonaRequest {
  constructor(operation, url, auth_token, body, onload, async=true) {
    this.operation = operation;
    if (url.includes('http')) this.url = url;
    else {
      if (window.location.href.includes('localhost')) this.url = `http://localhost:3000/${url}`;
      else this.url = `book.soona.co/${url}`;
    }
    this.auth_token = auth_token;
    this.body = body;
    this.onload = onload;
    this.status = null;
    this.response = null;
    this.async = async;
  }

  async send() {
    let soonaRequest = this;
    return new Promise(function (resolve, reject) {
      let request = new XMLHttpRequest();
      request.open(soonaRequest.operation, soonaRequest.url, soonaRequest.async);
      request = soonaRequest.setRequestHeaders(request);
      if (soonaRequest.auth_token) request.withCredentials = true;
      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          resolve(request);
        } else {
          reject(request);
        }
      }
      request.send(soonaRequest.body);
    }).then((request) => {
      this.status = request.status;
      this.response = request.response;
      this.onload(request);
    });
  }

  setRequestHeaders(request) {
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Access-Control-Allow-Origin", "*")
    if (this.auth_token) {
      request.setRequestHeader("X-SOONA-AUTH-PROVIDER", "soona_marketing")
      request.setRequestHeader("X-SOONA-PROVIDER-TOKEN", this.auth_token)
    }
    return request;
  }

}