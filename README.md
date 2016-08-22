### This is an application that powers the fleet of web scrapers used for the [API](https://github.com/marciaga/prediction-api) that supports [Predictions 2016](https://github.com/melismae/prediction2016).

For local development, you'll need MongoDB 3.2 installed.

Install the dependencies:
```
> $ npm install
```
Run your local MongoDB server:
```
> $ mongod
```

Run the Node server in dev mode:
```
> $ npm run dev
```

Run tests using Ava
```
> $ npm run test
```
For prototyping/sandboxing scrapers without running the full application, see the scripts directory prototyper.js. That file is meant to be altered as needed for developing new scrapers. It can be run via npm script:

`$ npm run prototype`



For security reasons, there is a .env file ignored by git. If you're interested in using this application as-is, you'd need to create a .env file in the project's root and supply the constants where applicable.
