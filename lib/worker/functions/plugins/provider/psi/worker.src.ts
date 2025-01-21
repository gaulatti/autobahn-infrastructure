import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';

/**
 * This function is the entry point for the worker.
 */
const API_URL = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * Represents the S3 client.
 */
const s3Client = new S3Client({});

/**
 * Represents the Lambda client.
 */
const lambdaClient = new LambdaClient({});

/**
 * Handles errors that occur during Axios requests.
 *
 * This function checks if the provided error is an Axios error. If it is,
 * it serializes the error object to extract relevant information such as
 * the error message, status code, response data, and request data, and logs
 * the serialized error to the console. If the error is not an Axios error,
 * it logs the unexpected error to the console.
 *
 * @param error - The error object to handle. It can be of any type.
 */
const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    /**
     * Serialize the error object to extract relevant information.
     */
    const serializedError = {
      message: error.message,
      code: error.response?.status || 'No status code',
      data: error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data',
      request: error.request || 'No request data',
    };

    console.error('Serialized Axios error:', JSON.stringify(serializedError, null, 2));
  } else {
    /**
     * Not an Axios error. Log the unexpected error.
     */
    console.error('Unexpected error:', JSON.stringify(error, null, 2));
  }
};

/**
 * Main handler function for processing SNS events.
 *
 * @param event - The event object containing SNS records.
 * @returns A promise that resolves when the processing is complete.
 *
 * The function performs the following steps:
 * 1. Parses the SNS message to extract the playlist information.
 * 2. Fetches data from PageSpeed Insights using the provided URL, strategy, and category.
 * 3. Uploads the fetched data to an S3 bucket.
 * 4. Invokes the SEGUE Lambda function with the playlist and output file information.
 *
 * If an error occurs during any of these steps, the function:
 * 1. Handles the Axios error.
 * 2. Invokes the SEGUE Lambda function with an error message and retry count.
 *
 * @throws Will throw an error if the URL is not provided in the event object.
 * @throws Will throw an error if the BUCKET_NAME environment variable is not set.
 * @throws Will throw an error if the SEGUE_ARN environment variable is not set.
 */
const main = async (event: any): Promise<void> => {
  const { Records } = event;

  for (const record of Records) {
    const {
      Sns: { Message },
    } = record;

    const playlist = JSON.parse(Message);

    const {
      id,
      category,
      strategy,
      retries,
      manifest: {
        context: { url },
      },
    } = playlist;

    const attempts = (retries || 0) + 1;

    if (!url) {
      throw new Error('URL is required in the event object.');
    }

    try {
      /**
       * Fetch data from PageSpeed Insights.
       */
      const response = await axios.get(API_URL, {
        params: {
          url,
          strategy,
          category,
        },
      });

      const lighthouseResult = response.data.lighthouseResult;

      /**
       * Upload the data to S3.
       */
      const outputFile = `${id}.${category}.${strategy}.json`;
      const bucketName = process.env.BUCKET_NAME;

      if (!bucketName) {
        throw new Error('Environment variable BUCKET_NAME is not set.');
      }

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: outputFile,
          Body: JSON.stringify(lighthouseResult),
          ContentType: 'application/json',
        })
      );

      /**
       * Invoke the SEGUE Lambda.
       */
      const segueMessage = { ...playlist, outputFile, action: 'SEGUE' };
      const segueArn = process.env.SEGUE_ARN;

      if (!segueArn) {
        throw new Error('Environment variable SEGUE_ARN is not set.');
      }

      await lambdaClient.send(
        new InvokeCommand({
          FunctionName: segueArn,
          InvocationType: 'RequestResponse',
          Payload: Buffer.from(JSON.stringify({ playlist: segueMessage })),
        })
      );
    } catch (error: any) {
      handleAxiosError(error);
      /**
       * Invoke the SEGUE Lambda with an error message.
       */
      const errorMessage = { ...playlist, status: 'FAILED', retries: attempts };
      const segueArn = process.env.SEGUE_ARN;

      if (!segueArn) {
        throw new Error('Environment variable SEGUE_ARN is not set.');
      }

      try {
        await lambdaClient.send(
          new InvokeCommand({
            FunctionName: segueArn,
            InvocationType: 'RequestResponse',
            Payload: Buffer.from(JSON.stringify({ playlist: errorMessage })),
          })
        );
      } catch (invokeError: any) {
        console.error('Failed to invoke SEGUE Lambda for error handling:', invokeError.message);
      }
    }
  }
};

export { main };
