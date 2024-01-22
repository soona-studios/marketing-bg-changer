When you pull this repository, you can test it by setting up a local python server. Navigate into the pulled directory of this repo and run `python3 -m http.server`. Then this repo is hosted at `http://localhost:8000/bg_changer.html`. You can also host this on our soona-local ngrok by runnning the python server, then visiting the directory and running `ngrok http --domain=local.soona.co 8000`. Currently it is setup for use with the public amazon background removal, which will not work from your localhost. If you want to use this from localhost use the following code, with the key difference being the inclusion of an api-key and hitting a different url.

This code is sent to our marketing site via the CDN jsdelivr, [here are the docs](https://www.jsdelivr.com/?docs=gh). Each file is sent separately to support the import statements, but you could choose to combine them. Then in webflow you enter design mode, visit the page you want them on, and add them as script tags with the src as the url and `type="module"`

When you make changes to your public repositroy hosting the scripts for your cdn, you can visit [this website to clear the CDN cache](https://www.jsdelivr.com/tools/purge). This instantly updates the js being delivered to your page to make testing faster.
