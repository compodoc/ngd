#! /bin/bash

for m in `ls src/modules`; do

  echo ">> Testing $m ..."
  (cd "src/modules/$m" && npm run xtest)

done