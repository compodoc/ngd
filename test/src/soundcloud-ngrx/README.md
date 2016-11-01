[![CircleCI](https://circleci.com/gh/r-park/soundcloud-ngrx.svg?style=shield&circle-token=1a1c9e0d11ebc084768c68fa31349e93f48634e6)](https://circleci.com/gh/r-park/soundcloud-ngrx)


# SoundCloud NgRx

A basic SoundCloud API client built with Angular2 and NgRx. Try the [live demo](https://soundcloud-ngrx.herokuapp.com).

![screenshot](http://i.imgur.com/A1Vlpi2.png)


Stack
-----

- Angular2
- NgRx Effects
- NgRx Store
- RxJS
- Immutable
- Ava
- Circle CI
- Express
- Heroku
- Karma
- Typescript
- Webpack


Quick Start
-----------

```shell
$ git clone https://github.com/r-park/soundcloud-ngrx.git
$ cd soundcloud-ngrx
$ npm install
$ npm start
```


NPM Commands
------------

|Command|Description|
|---|---|
|npm start|Start webpack development server @ **localhost:3000**|
|npm run build|Build production bundles to **./target** directory|
|npm run server|Start express server @ **localhost:3000** to serve built artifacts from **./target** directory|
|npm test|Lint and run tests|
|npm run test:watch|Run tests; watch for changes to re-run tests|
