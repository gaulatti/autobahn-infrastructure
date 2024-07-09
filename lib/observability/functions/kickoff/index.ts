import { Duration, Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';


/**
 * Creates a kickoff lambda function.
 * 
 * @param stack - The AWS CloudFormation stack.
 * @param observabilityBucket - The S3 bucket for observability.
 * @param dataAccessLambda - The data access lambda function.
 * @returns An object containing the kickoff lambda function.
 */
const createKickoffLambda = (stack: Stack, dataAccessLambda: NodejsFunction) => {
    /**
     * Create Processing Lambda
     */
    const kickoffLambda = new NodejsFunction(stack, `${stack.stackName}KickoffLambda`, {
        functionName: `${stack.stackName}Kickoff`,
        entry: './lib/observability/functions/kickoff/index.src.ts',
        handler: 'main',
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.minutes(1),
        environment: {
            DATA_ACCESS_ARN: dataAccessLambda.functionArn,
        },
        memorySize: 1024,
    });

    /**
     * Allow this lambda to save the metrics in the Database.
     */
    dataAccessLambda.grantInvoke(kickoffLambda);

    return { kickoffLambda };
};

export { createKickoffLambda };
