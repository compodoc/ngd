[![Build status](https://ci.appveyor.com/api/projects/status/45ou8frsi43v7j8r?svg=true)](https://ci.appveyor.com/project/vogloblinsky/ngd/branch/master)
[![CircleCI](https://circleci.com/gh/compodoc/ngd/tree/master.svg?style=svg)](https://circleci.com/gh/compodoc/ngd/tree/master)
[![Code Climate](https://codeclimate.com/github/compodoc/ngd/badges/gpa.svg)](https://codeclimate.com/github/compodoc/ngd)

<table>
  <tr>
    <td align="right">CLI</td>
    <td><a href="https://badge.fury.io/js/%40compodoc%2Fngd-cli"><img src="https://badge.fury.io/js/%40compodoc%2Fngd-cli.svg" alt="npm version" height="18"></a></td>
  </tr>
  <tr>
    <td align="right">Core</td>
    <td><a href="https://badge.fury.io/js/%40compodoc%2Fngd-core"><img src="https://badge.fury.io/js/%40compodoc%2Fngd-core.svg" alt="npm version" height="18"></a></td>
  </tr>
  <tr>
    <td align="right">Compiler</td>
    <td><a href="https://badge.fury.io/js/%40compodoc%2Fngd-compiler"><img src="https://badge.fury.io/js/%40compodoc%2Fngd-compiler.svg" alt="npm version" height="18"></a></td>
  </tr>
  <tr>
    <td align="right">Transformer</td>
    <td><a href="https://badge.fury.io/js/%40compodoc%2Fngd-transformer"><img src="https://badge.fury.io/js/%40compodoc%2Fngd-transformer.svg" alt="npm version" height="18"></a></td>
  </tr>
</table>

# NGD: Angular Dependencies Graph

A tool that allows you to view your Angular application dependencies.

## Generated Graphs (sample)

#### Sample Application

![screenshots-4](https://raw.githubusercontent.com/compodoc/ngd/master/screenshots/dependencies-4.png)

#### Angular Material 2

<img src="https://cdn.rawgit.com/compodoc/ngd/master/screenshots/dependencies.material2.svg"/>

#### ng-bootstrap

<img src="https://cdn.rawgit.com/compodoc/ngd/master/screenshots/dependencies.ng-bootstrap.svg"/>

#### soundcloud-ngrx

<img src="https://cdn.rawgit.com/compodoc/ngd/master/screenshots/dependencies.soundcloud-ngrx.svg"/>

## Install

Install from npm:

```
npm install -g @compodoc/ngd-cli
```

Install from Yarn:

```
yarn global add @compodoc/ngd-cli
```

## Usage the CLI

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
$ cd my-awesome-cli-angular-app/
$ ngd
$ # or
$ ngd -p ./tsconfig.json
```

Note: This will read the `files` entry point in your `tsconfig.json` and crawl your app. If the entry point is not
found, all `*.ts` files will be crawled, but not those mentioned in the `exclude` property ([more details](https://www.typescriptlang.org/docs/handbook/tsconfig.json.html#details)).

### 2) provide an entry file:

```bash
$ cd my-awesome-cli-angular-app/
$ ngd -f src/main.ts
```

NOTE: The file you provide should contain your root component.

## Usage the API

1. Import the `DotEngine` and `Compiler` from `@compodoc/ngd-transformer` and `@compodoc/ngd-compiler`:

```javascript
import { DotEngine } from '@compodoc/ngd-transformer';
import { Compiler } from '@compodoc/ngd-compiler';
```

2. Create an instance of a compiler:

```javascript
const compiler = new Compiler(files, {
  tsconfigDirectory: cwd
});
```

3. Get the found dependencies:

```javascript
const deps = compiler.getDependencies();
```

4. Pass those dependencies to the transformer:

```javascript
const engine = new DotEngine({
  output: program.output,
  displayLegend: program.displayLegend,
  outputFormats: program.outputFormats.split(',')
});
```

5. Generate the graph:

```javascript
engine.generateGraph(deps).then(file => { ... });
```

## Have a PR?

All contributions are welcome ;)

## License

The MIT License (MIT)
Copyright (c) 2016 - Wassim CHEGHAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
