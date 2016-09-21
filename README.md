[![GetBadges Game](https://manekinekko-angular2-dependencies-graph.getbadges.io/shield/company/manekinekko-angular2-dependencies-graph)](https://manekinekko-angular2-dependencies-graph.getbadges.io/?ref=shield-game)
[![Join the chat at https://gitter.im/manekinekko/angular2-dependencies-graph](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/manekinekko/angular2-dependencies-graph?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/angular2-dependencies-graph.svg)](https://badge.fury.io/js/angular2-dependencies-graph)

angular2-dependencies-graph
====
A tool that allows you to view your Angular2 application dependencies. Currently, the tool only supports apps written in TypeScript.

## Generated Graphs (sample)

![screenshots-1](https://raw.githubusercontent.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies-1.png)

![screenshots-2](https://raw.githubusercontent.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies-2.png)

![screenshots-3](https://raw.githubusercontent.com/manekinekko/angular2-dependencies-graph/master/screenshots/dependencies-3.gif)

## Install

Install from npm: `npm install -g angular2-dependencies-graph`

## Usage

```
$ ng2-dg --help

Usage: ng2-dg [options]

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -f, --file [file]        Entry *.ts file
  -t, --tsconfig [config]  A tsconfig.json
  -l, --files [list]       A list of *.ts files
  -o, --open               Open the generated diagram file
  -d, --output [folder]    Where to store the generated files
```

### 1) use a `tsconfig.json`:
Run inside your project (where your `tsconfig.json` is located):

```bash
$ cd my-awesome-angular2-app/
$ ng2-dg
$ # or
$ ng2-dg --tsconfig ./tsconfig.json
```

Note: This will read the `files` entry point in your `tsconfig.json` and crawl your app. If the entry point is not
found, all `*.ts` files will be crawled, but not those mentioned in the `exclude` property ([more details](https://www.typescriptlang.org/docs/handbook/tsconfig.json.html#details)).

### 2) provide an entry file:

```bash
$ cd my-awesome-angular2-app/
$ ng2-dg --file app.ts
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
