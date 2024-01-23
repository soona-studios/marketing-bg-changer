When you pull this repository, you can test it by setting up a local python server. Navigate into the pulled directory of this repo and run `python3 -m http.server`. Then this repo is hosted at `http://localhost:8000/bg_changer.html`. You can also host this on our soona-local ngrok by runnning the python server, then visiting the directory and running `ngrok http --domain=local.soona.co 8000`.

Releasing New Code
===================
This code is sent to our marketing site via the CDN jsdelivr, [here are the docs](https://www.jsdelivr.com/?docs=gh). Each file is sent separately to support the import statements, but you could choose to combine them. Then in webflow you enter design mode, visit the page you want them on, and add them as script tags with the src as the url and `type="module"`

When you make changes to your public repositroy hosting the scripts for jsdelivr the marketing site will not be updated. Instead, you'll have to make a new release because the links are using @latest in order to more dynamically pull in scripts and avoid over caching. Once you make a new release you can visit [this website to clear the CDN cache](https://www.jsdelivr.com/tools/purge) and enter the urls for the files that were updated. This instantly updates the js being delivered to your page to make testing faster, but you will be throttled if you do it too much.
