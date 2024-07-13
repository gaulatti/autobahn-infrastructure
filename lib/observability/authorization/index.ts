import { Stack } from 'aws-cdk-lib';
import { OAuthScope, ProviderAttribute, UserPool, UserPoolClient, UserPoolDomain, UserPoolIdentityProviderGoogle } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates a Cognito Pool with user pool, user pool domain, Okta identity provider,
 * user pool client, and user pool resource server.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param preTokenGenerationLambda - The pre-token generation lambda function.
 */
const createCognitoAuth = (stack: Stack, preTokenGenerationLambda: NodejsFunction) => {
  /**
   * Create User Pool
   */
  const userPool = new UserPool(stack, `${stack.stackName}UserPool`, {
    userPoolName: `${stack.stackName}UserPool`,
    selfSignUpEnabled: true,
    lambdaTriggers: {
      preTokenGeneration: preTokenGenerationLambda
    },
  });

  /**
   * Create User Pool Domain
   */
  const userPoolDomain = new UserPoolDomain(stack, `${stack.stackName}Domain`, {
    userPool,
    cognitoDomain: {
      domainPrefix: `${stack.stackName.toLowerCase()}`,
    },
  });

  /**
   * Create Google Provider
   */
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    try {
      new UserPoolIdentityProviderGoogle(stack, `${stack.stackName}GoogleProvider`, {
        userPool,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
          givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
          fullname: ProviderAttribute.GOOGLE_NAMES,
        },
      });
    } catch (e) {
      console.error(`Error creating Google Provider, ${e}`);
    }
  }

  /**
   * Create User Pool Client
   */
  const userPoolClient = new UserPoolClient(stack, `${stack.stackName}UserPoolClient`, {
    userPoolClientName: `${stack.stackName}UserPoolClient`,
    userPool,
    generateSecret: false,
    oAuth: {
      flows: {
        authorizationCodeGrant: true,
        implicitCodeGrant: true,
      },
      scopes: [OAuthScope.OPENID, OAuthScope.COGNITO_ADMIN, OAuthScope.EMAIL, OAuthScope.PROFILE],
      callbackUrls: ['http://localhost:5173', `https://${process.env.FRONTEND_FQDN}`],
      logoutUrls: ['http://localhost:5173/logout', `https://${process.env.FRONTEND_FQDN}/logout`],
    },
  });

  /**
   * Create User Pool Mobile Client
   */
  userPool.addClient(`${stack.stackName}PoolMobileClient`, {
    userPoolClientName: `${stack.stackName}PoolMobileClient`,
    oAuth: {
      flows: {
        authorizationCodeGrant: true,
        implicitCodeGrant: true,
      },
      scopes: [OAuthScope.OPENID, OAuthScope.COGNITO_ADMIN, OAuthScope.EMAIL, OAuthScope.PROFILE],
      callbackUrls: ['madonna://login'],
      logoutUrls: ['madonna://logout'],
    },
  });

  return { userPool, userPoolDomain, userPoolClient };
};

export { createCognitoAuth };
