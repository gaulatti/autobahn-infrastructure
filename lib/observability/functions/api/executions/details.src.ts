import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { isWarmup } from '../../../../common/utils';
import { buildCorsOutput } from '../../../../common/utils/api';
import { streamToString } from '../../../../common/utils/s3';
const client = new S3Client();

const main = async (event: AWSLambda.APIGatewayEvent) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  const { path, pathParameters } = event;
  const { uuid } = pathParameters!;
  const viewport = path.split('/').pop();

  const bucketName = process.env.BUCKET_NAME;
  const key = `${uuid}.${viewport}.json`;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await client.send(command);
    const output = await streamToString(response.Body as Readable);
    return buildCorsOutput(event, 200, output, false);
  } catch (error) {
    console.error('Error:', error);
    return buildCorsOutput(event, 500, { error: 'Internal Server Error' });
  }
};

export { main };
