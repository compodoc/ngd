[![Build status](https://ci.appveyor.com/api/projects/status/wlla9cm0vcie4lur/branch/master?svg=true)](https://ci.appveyor.com/project/manekinekko/angular2-dependencies-graph/branch/master)
[![CircleCI](https://circleci.com/gh/manekinekko/angular2-dependencies-graph/tree/master.svg?style=svg)](https://circleci.com/gh/manekinekko/angular2-dependencies-graph/tree/master)
[![Join the chat at https://gitter.im/manekinekko/angular2-dependencies-graph](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/manekinekko/angular2-dependencies-graph?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/angular2-dependencies-graph.svg)](https://badge.fury.io/js/angular2-dependencies-graph)
[![Code Climate](https://codeclimate.com/github/manekinekko/angular2-dependencies-graph/badges/gpa.svg)](https://codeclimate.com/github/manekinekko/angular2-dependencies-graph)

angular2-dependencies-graph
====
A tool that allows you to view your Angular2 application dependencies. Currently, the tool only supports apps written in TypeScript.

## Generated Graphs (sample)

#### Sample Application
![screenshots-4](https://raw.githubusercontent.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies-4.png)

#### Angular Material 2 
<img src="https://cdn.rawgit.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies.material2.svg"/>

#### ng-bootstrap
<img src="https://cdn.rawgit.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies.ng-bootstrap.svg"/>

#### soundcloud-ngrx
<img src="https://cdn.rawgit.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies.soundcloud-ngrx.svg"/>

## Install

Install from npm: 

```
npm install -g angular2-dependencies-graph
```

Install from Yarn: 

```
yarn global add angular2-dependencies-graph
```

## Usage

```
$ ngd --help

Usage: ngd [options]

Options:

  -h, --help                    Output usage information
  -V, --version                 Output the version number
  -f, --file [file]             Entry *.ts file
  -p, --tsconfig [config]       A tsconfig.json
  -l, --files [list]            A list of *.ts files
  -g, --display-legend          Display the legend in the generated graph (default: true)
  -s, --silent                  In silent mode, log messages aren't logged in the console
  -t, --output-formats [formats] Output formats (default: html,svg,dot,json)
  -d, --output [folder]         Where to store the generated files
```

### 1) use a `tsconfig.json`:
Run inside your project (where your `tsconfig.json` is located):

```bash
$ cd my-awesome-cli-angular2-app/
$ ngd
$ # or
$ ngd -p ./tsconfig.json
```

Note: This will read the `files` entry point in your `tsconfig.json` and crawl your app. If the entry point is not
found, all `*.ts` files will be crawled, but not those mentioned in the `exclude` property ([more details](https://www.typescriptlang.org/docs/handbook/tsconfig.json.html#details)).

### 2) provide an entry file:

```bash
$ cd my-awesome-cli-angular2-app/
$ ngd -f src/main.ts
```

NOTE: The file you provide should contain your root component.

## Have a PR?

All contributions are welcome ;)

## License

The MIT License (MIT)
Copyright (c) 2016 - Wassim CHEGHAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
