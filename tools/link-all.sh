#! /bin/bash

rm -rf src/modules/transformer/node_modules/@compodoc/ngd-core
rm -rf src/modules/transformer/node_modules/typescript
cd src/modules/transformer/node_modules/@compodoc/
ln -s ../../../core ngd-core
cd ../
ln -s ../../core/node_modules/typescript typescript

cd ../../../../

rm -rf src/modules/compiler/node_modules/@compodoc/ngd-core
cd src/modules/compiler/node_modules/@compodoc/
ln -s ../../../core ngd-core

cd ../../../../../
rm -rf src/modules/cli/node_modules/@compodoc/ngd-core
rm -rf src/modules/cli/node_modules/@compodoc/ngd-compiler
rm -rf src/modules/cli/node_modules/@compodoc/ngd-transformer
cd src/modules/cli/node_modules/@compodoc/
ln -s ../../../core ngd-core
ln -s ../../../compiler ngd-compiler
ln -s ../../../transformer ngd-transformer