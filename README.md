[![GetBadges Game](https://manekinekko-angular2-dependencies-graph.getbadges.io/shield/company/manekinekko-angular2-dependencies-graph)](https://manekinekko-angular2-dependencies-graph.getbadges.io/?ref=shield-game)
[![Join the chat at https://gitter.im/manekinekko/angular2-dependencies-graph](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/manekinekko/angular2-dependencies-graph?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Issue Stats](http://issuestats.com/github/manekinekko/angular2-dependencies-graph/badge/pr)](http://issuestats.com/github/manekinekko/angular2-dependencies-graph)
[![Issue Stats](http://issuestats.com/github/manekinekko/angular2-dependencies-graph/badge/issue)](http://issuestats.com/github/manekinekko/angular2-dependencies-graph)
[![npm version](https://badge.fury.io/js/angular2-dependencies-graph.svg)](https://badge.fury.io/js/angular2-dependencies-graph)

angular2-dependencies-graph
====
A tool that allows you to view your Angular2 application dependencies. (WIP...)

## Generated Graphs (sample)

![screenshots-1](https://raw.githubusercontent.com/manekinekko/angular2-dependencies-graph/master/screenshots/ng2-deps-graph-1.png)


![screenshots-2](https://raw.githubusercontent.com/manekinekko/angular2-dependencies-graph/master/screenshots/ng2-deps-graph-2.png)


## Install

Install from npm: `npm i -g angular2-dependencies-graph`

Make sure you have installed typescript & typings as well:
`npm i -g typescript typings`

## Usage

### 1) use a `tsconfig.json`:
Run inside your project (where your `tsconfig.json` is located:

```bash
$ cd project/
$ ng2-deps-graph
```

Note: This will read the `files` entry point in your `tsconfig.json` and crawl your app.

### 2) provide an entry file:

```bash
$ ng2-deps-graph app.ts
```

NOTE: The file you provide should contain your root component.

## Have a PR?

All contribution are welcome ;)

## License

The MIT License (MIT)
Copyright (c) 2016 - Wassim CHEGHAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
