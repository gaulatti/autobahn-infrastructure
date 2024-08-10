import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent, Callback, Context } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { isWarmup } from '../../../common/utils';

/**
 * Initializes a JWKS client for retrieving JSON Web Key Sets.
 *
 * @param jwksUri - The URI of the JWKS endpoint.
 * @returns The JWKS client.
 */
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_USER_POOL_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

/**
 * Generates an API Gateway authorizer policy.
 *
 * @param effect - The effect of the policy, either 'Allow' or 'Deny'.
 * @param connectionId - The connection ID associated with the policy.
 * @returns The generated APIGatewayAuthorizerResult object.
 */
const generatePolicy = (effect: 'Allow' | 'Deny', connectionId: string): APIGatewayAuthorizerResult => {
  return {
    principalId: connectionId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*',
        },
      ],
    },
    context: {
      connectionId: connectionId,
    },
  };
};

/**
 * Retrieves the signing key for the given header.
 *
 * @param header - The header object containing the key ID.
 * @param callback - The callback function to be called with the signing key.
 */
const getKey = (header: any, callback: any) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key!.getPublicKey();
    callback(null, signingKey);
  });
};

/**
 * Entry point for the authorizer function.
 *
 * @param event - The event object containing the request details.
 * @param _context - The context object representing the runtime information.
 * @param callback - The callback function to be called with the authorization result.
 */
const main = (event: APIGatewayRequestAuthorizerEvent, _context: Context, callback: Callback<APIGatewayAuthorizerResult>): void => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  const { queryStringParameters } = event;
  const token = queryStringParameters!.Authorization;

  if (!token) {
    callback(null, generatePolicy('Deny', event.requestContext.connectionId!));
  }

  jwt.verify(token!, getKey, (err, _decoded) => {
    if (err) {
      callback(null, generatePolicy('Deny', event.requestContext.connectionId!));
    }

    callback(null, generatePolicy('Allow', event.requestContext.connectionId!));
  });
};

export { main };
