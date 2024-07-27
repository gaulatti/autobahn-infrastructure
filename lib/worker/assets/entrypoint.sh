#!/bin/bash

# Start Chrome in the background
google-chrome --headless --no-sandbox --disable-dev-shm-usage --remote-debugging-port=9222 &

# Wait for Chrome to start
sleep 5

# Run Lighthouse using the pre-started Chrome instance
lighthouse --port=9222 --chrome-flags="--no-sandbox --disable-dev-shm-usage --headless --remote-debugging-port=9222" $TARGET_PARAMETER $PRESET_FLAG --output=json --output-path=./$UUID.json

echo "Lighthouse Complete, time to upload"

# Upload the Lighthouse report to the S3 bucket with a random UUID filename
aws s3 cp ./$UUID.json s3://$BUCKET_NAME/$UUID.$MODE.json

echo "Upload Complete"
