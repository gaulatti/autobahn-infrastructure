#!/bin/bash

mkdir ./.lighthouseci && lighthouse --chrome-flags="--no-sandbox --disable-dev-shm-usage --headless --remote-debugging-port=9222" $TARGET_PARAMETER --output=json --output-path=./.lighthouseci/lhr-123456789.json  && lhci upload --config=./lhci.config.js
