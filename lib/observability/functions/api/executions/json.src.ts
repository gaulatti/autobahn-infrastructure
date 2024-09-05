import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
 import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HandleDelivery } from '../../../../common/utils/api';

 const client = new S3Client();

 const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
   const { path, pathParameters, queryStringParameters } = event;
   const { uuid } = pathParameters!;

   /**
    * Get Viewport from URL
    */
   const parts = path.split('/');
   const viewport = parts[parts.length - 2]

   /**
    * Get the user from the Authorization header.
    */
   const minified = Object.keys(queryStringParameters || {}).includes('minified');

   console.log({ path, pathParameters, viewport, queryStringParameters, minified });

   const bucketName = process.env.BUCKET_NAME;
   const key = `${uuid}.${viewport}${minified ? '.min' : ''}.json`;

   const command = new GetObjectCommand({
     Bucket: bucketName,
     Key: key,
   });

   const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

   return { signedUrl };
 });

 export { main };