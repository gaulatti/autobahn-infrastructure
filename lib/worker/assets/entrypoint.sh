#!/bin/bash

# Start Chrome in the background
google-chrome --headless --no-sandbox --disable-dev-shm-usage --remote-debugging-port=9222 &

# Wait for Chrome to start
sleep 5

# Create the directory for Lighthouse CI results
mkdir -p ./.lighthouseci

# Run Lighthouse using the pre-started Chrome instance
lighthouse --port=9222 --chrome-flags="--no-sandbox --disable-dev-shm-usage --headless --remote-debugging-port=9222" $TARGET_PARAMETER $PRESET_FLAG --output=json --output-path=./.lighthouseci/lhr-123456789.json

echo "Lighthouse Complete, time to upload"

lhci upload --config=./lhci.config.js
