# ngd architecture and operating

## Dependencies between modules

-   cli : core, compiler, transformer
-   compiler : core
-   transformer : core
-   core : -

## Main dependencies by module

-   core : ansi-colors, fancy-log, typescript
-   transformer : @compodoc/ngd-core, dot, fs-extra, @aduh95/viz.js
-   compiler : typescript, @compodoc/ngd-core
-   cli : @compodoc/ngd-core, @compodoc/ngd-compiler, @compodoc/ngd-transformer, colors, commander, dot, fs-extra, opener, typescript

## Order publish on npm

-   core
-   transformer
-   compiler
-   cli

## Publish

Upgrade version in each package

```
cd src/modules/xxx
npm run compile:src
npm publish --access public
```
