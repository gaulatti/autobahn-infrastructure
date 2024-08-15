#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Set NODE_OPTIONS as a global environment variable
export NODE_OPTIONS="--max_old_space_size=14336"

# Function to trigger Lambda on failure
trigger_lambda_on_failure() {
    echo "Script failed, triggering Lambda..."

    # Create a JSON payload with $UUID and $MODE
    PAYLOAD=$(jq -n \
      --arg uuid "$UUID" \
      --arg mode "$MODE" \
      --arg error "FAILED" \
      '{status: $error, uuid: $uuid, mode: $mode}')

    # Invoke the Lambda function with the payload
    aws lambda invoke --function-name $ERROR_LAMBDA_ARN --payload "$PAYLOAD" /dev/null
}

# Set up a trap to catch errors and trigger the Lambda function
trap 'trigger_lambda_on_failure' ERR

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
