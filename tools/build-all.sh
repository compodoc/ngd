#! /bin/bash

for m in `ls src/modules`; do

  echo ">> Building $m ..."
  (cd "src/modules/$m" && npm run compile:src)

done

node src/modules/cli/bin/index.js -p src/modules/cli/test/src/soundcloud-ngrx/tsconfig.json 
