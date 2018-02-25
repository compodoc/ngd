# ngd architecture and operating

## Dependencies between modules

* cli : core, compiler, transformer
* compiler : core
* transformer : core
* core : -

## Order publish on npm

* core
* transformer
* compiler
* cli

## Publish

```
cd src/modules/xxx
npm run compile:src
npm publish --access public
```
