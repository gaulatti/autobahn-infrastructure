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
      // Fetch data from PageSpeed Insights
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
      console.error('Error fetching PageSpeed Insights or processing data:', error.message);

      // ACTION 3: Handle Failure
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
