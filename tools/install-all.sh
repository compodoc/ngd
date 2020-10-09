#! /bin/bash

for m in `ls src/modules`; do

  echo ">> Installing $m ..."
  (cd "src/modules/$m" && rm -rf node_modules && npm install)

done