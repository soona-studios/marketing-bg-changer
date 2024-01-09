When you pull this repository, you can test it by setting up a local python server. Navigate into the pulled directory of this repo and run `python3 -m http.server`. Then this repo is hosted at `http://localhost:8000/bg_changer.html`. You can also host this on our soona-local ngrok by runnning the python server, then visiting the directory and running `ngrok http --domain=local.soona.co 8000`. Currently it is setup for use with the public amazon background removal, which will not work from your localhost. If you want to use this from localhost use ``` const resp = await AwsWafIntegration.fetch('https://h1shutsx84.execute-api.us-west-1.amazonaws.com/cv-service/v1/background/remove',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "x-api-key": "7HhDS7PHvc0UfEcecVlPZ06Ps4VUcQYVLPiFptNQ"
                },
                body: JSON.stringify(imageRequest)
            });```
