import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { HandleDelivery } from '../../../../common/utils/api';
import { streamToString } from '../../../../common/utils/s3';
const client = new S3Client();

const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { path, pathParameters } = event;
  const { uuid } = pathParameters!;
  const viewport = path.split('/').pop();

  const bucketName = process.env.BUCKET_NAME;
  const key = `${uuid}.${viewport}.json`;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(command);
  const output = await streamToString(response.Body as Readable);
  return { report: output };
});

export { main };
