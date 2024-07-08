import { Stack } from 'aws-cdk-lib';
import {
  CfnUserPoolResourceServer,
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  UserPoolIdentityProviderApple,
  UserPoolIdentityProviderGoogle,
} from 'aws-cdk-lib/aws-cognito';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { buildPostAuthenticationTrigger, buildPreAuthenticationTrigger } from './triggers';

/**
 * Creates a Cognito Pool with user pool, user pool domain, Okta identity provider,
 * user pool client, and user pool resource server.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param oktaMetadataSecret - The Okta metadata secret.
 */
const createCognitoAuth = (stack: Stack, frontendFqdnSecret: Secret, appleSecret?: Secret, googleSecret?: Secret) => {
  /**
   * Create User Pool
   */
  const userPool = new UserPool(stack, `${stack.stackName}UserPool`, {
    userPoolName: `${stack.stackName}UserPool`,
    selfSignUpEnabled: true,
    lambdaTriggers: {
      preAuthentication: buildPreAuthenticationTrigger(stack),
      postAuthentication: buildPostAuthenticationTrigger(stack),
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
   * Create Identity Providers
   */
  if (appleSecret) {
    try {
      const { clientId, teamId, keyId, privateKey } = JSON.parse(appleSecret.secretValue.unsafeUnwrap());
      new UserPoolIdentityProviderApple(stack, `${stack.stackName}AppleProvider`, {
        userPool: userPool,
        clientId,
        teamId,
        keyId,
        privateKey,
        scopes: ['profile', 'email', 'openid'],
        attributeMapping: {
          email: ProviderAttribute.APPLE_EMAIL,
          familyName: ProviderAttribute.APPLE_LAST_NAME,
          givenName: ProviderAttribute.APPLE_FIRST_NAME,
          fullname: ProviderAttribute.APPLE_NAME,
        },
      });
    } catch (e) {
      console.error(`Error creating Apple Provider, ${e}`);
    }
  }

  /**
   * Create Google Provider
   */
  if (googleSecret) {
    try {
      const { clientId, clientSecret } = JSON.parse(googleSecret.secretValue.unsafeUnwrap());
      new UserPoolIdentityProviderGoogle(stack, `${stack.stackName}GoogleProvider`, {
        userPool,
        clientId,
        clientSecret,
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
      callbackUrls: ['http://localhost:5173', `https://${frontendFqdnSecret.secretValue.unsafeUnwrap()}`],
      logoutUrls: ['http://localhost:5173/logout', `https://${frontendFqdnSecret.secretValue.unsafeUnwrap()}/logout`],
    },
  });

  /**
   * Create User Pool Resource Server
   */
  new CfnUserPoolResourceServer(stack, `${stack.stackName}SamlAttributeMapping`, {
    name: 'Okta',
    identifier: 'saml',
    userPoolId: userPool.userPoolId,
    scopes: [
      {
        scopeName: 'email',
        scopeDescription: 'email',
      },
    ],
  });

  /**
   * Create User Pool Mobile Client
   */
  userPool.addClient(`${stack.stackName}PoolMobileClient`, {
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

  return { userPool };
};

export { createCognitoAuth };
