#!/usr/bin/env bash

set -ex

# build and test
npm install
npm run build
ls -l lib
test -r lib/index.iife.js
test -r lib/index.cjs.js
test -r lib/index.esm.js
npm run ok
npm run codecov
