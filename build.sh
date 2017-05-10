#!/bin/bash

npm run install-npm
npm run install-node
[ ! -d ./build ] && mkdir -p build
tar -zcvf build/upload-tools.tar.gz node_modules/ index.html login.html package.json server.js
