#! /bin/bash

for m in `ls src/modules`; do

  echo ">> Building $m ..."
  (cd "src/modules/$m" && npm run compile:src)

done