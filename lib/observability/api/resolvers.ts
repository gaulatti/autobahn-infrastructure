import { Stack } from 'aws-cdk-lib';
import { Code, FunctionRuntime, LambdaDataSource } from 'aws-cdk-lib/aws-appsync';

/**
 * Creates resolver code for a given field name.
 *
 * @param fieldName - The name of the field.
 * @returns The resolver code as a string.
 */
const createResolverCode = (fieldName: string) => `
  export function request(ctx) {
    const { source, args } = ctx;

    return {
      operation: 'Invoke',
      payload: {
        field: ctx.info.fieldName,
        sub: ctx.identity.claims.sub,
        arguments: args,
        source
      },
    };
  }

  export function response(ctx) {
    return ctx.result.${fieldName};
  }
`;

/**
 * Creates resolver properties for a given type and field.
 * @param typeName - The name of the type.
 * @param fieldName - The name of the field.
 * @returns The resolver properties.
 */
const createResolverProps = (typeName: string, fieldName: string) => ({
  typeName,
  fieldName,
  runtime: FunctionRuntime.JS_1_0_0,
  code: Code.fromInline(createResolverCode(fieldName)),
});


/**
 * Creates resolvers for the given stack and data sources.
 * @param stack - The stack object.
 * @param dataSources - The data sources object.
 */
const createResolvers = (stack: Stack, dataSources: Record<string, LambdaDataSource>) => {

  /**
   * Query Resolvers
   */
  dataSources.kickoffDataSource.createResolver(`${stack.stackName}QueryKickoffResolver`, createResolverProps('Query', 'kickoff'));
  dataSources.projectDataSource.createResolver(`${stack.stackName}QueryProjectsResolver`, createResolverProps('Query', 'projects'));
  dataSources.beaconDataSource.createResolver(`${stack.stackName}QueryBeaconsResolver`, createResolverProps('Query', 'beacons'));
  dataSources.scheduleDataSource.createResolver(`${stack.stackName}QuerySchedulesResolver`, createResolverProps('Query', 'schedules'));
  dataSources.userDataSource.createResolver(`${stack.stackName}QueryUsersResolver`, createResolverProps('Query', 'users'));

  /**
   * Kickoff Entity Resolvers
   */
  dataSources.kickoffDataSource.createResolver(`${stack.stackName}KickoffMeResolver`, createResolverProps('Kickoff', 'me'));
  dataSources.kickoffDataSource.createResolver(`${stack.stackName}KickoffFeaturesResolver`, createResolverProps('Kickoff', 'features'));

  /**
   * User Entity Resolvers
   */
  dataSources.userDataSource.createResolver(`${stack.stackName}UserMembershipsResolver`, createResolverProps('User', 'memberships'));
  dataSources.userDataSource.createResolver(`${stack.stackName}UserAssignmentsResolver`, createResolverProps('User', 'assignments'));

  /**
   * Team Entity Resolvers
   */
  dataSources.teamDataSource.createResolver(`${stack.stackName}TeamMembershipsResolver`, createResolverProps('Team', 'memberships'));
  dataSources.teamDataSource.createResolver(`${stack.stackName}TeamAssignmentsResolver`, createResolverProps('Team', 'assignments'));
  dataSources.teamDataSource.createResolver(`${stack.stackName}TeamBeaconsResolver`, createResolverProps('Team', 'beacons'));
  dataSources.teamDataSource.createResolver(`${stack.stackName}TeamProjectsResolver`, createResolverProps('Team', 'projects'));

  /**
   * Project Entity Resolvers
   */
  dataSources.projectDataSource.createResolver(`${stack.stackName}ProjectTeamResolver`, createResolverProps('Project', 'team'));
  dataSources.projectDataSource.createResolver(`${stack.stackName}ProjectTargetsResolver`, createResolverProps('Project', 'targets'));
  dataSources.projectDataSource.createResolver(`${stack.stackName}ProjectAssignmentsResolver`, createResolverProps('Project', 'assignments'));

  /**
   * Target Entity Resolvers
   */
  dataSources.targetDataSource.createResolver(`${stack.stackName}TargetProjectResolver`, createResolverProps('Target', 'project'));
  dataSources.targetDataSource.createResolver(`${stack.stackName}TargetSchedulesResolver`, createResolverProps('Target', 'schedules'));
  dataSources.targetDataSource.createResolver(`${stack.stackName}TargetBeaconsResolver`, createResolverProps('Target', 'beacons'));
  dataSources.targetDataSource.createResolver(`${stack.stackName}TargetEngagementsResolver`, createResolverProps('Target', 'engagements'));
  dataSources.targetDataSource.createResolver(`${stack.stackName}TargetStatisticsResolver`, createResolverProps('Target', 'statistics'));

  /**
   * Schedule Entity Resolvers
   */
  dataSources.scheduleDataSource.createResolver(`${stack.stackName}ScheduleTargetResolver`, createResolverProps('Schedule', 'target'));

  /**
   * Assignment Entity Resolvers
   */
  dataSources.engagementDataSource.createResolver(`${stack.stackName}EngagementTargetResolver`, createResolverProps('Engagement', 'target'));
  dataSources.assignmentDataSource.createResolver(`${stack.stackName}AssignmentMembershipResolver`, createResolverProps('Assignment', 'membership'));

  /**
   * Beacon Entity Resolvers
   */
  dataSources.beaconDataSource.createResolver(`${stack.stackName}BeaconTeamResolver`, createResolverProps('Beacon', 'team'));
  dataSources.beaconDataSource.createResolver(`${stack.stackName}BeaconTargetResolver`, createResolverProps('Beacon', 'target'));
  dataSources.beaconDataSource.createResolver(`${stack.stackName}BeaconTriggeredByResolver`, createResolverProps('Beacon', 'triggered_by'));

  /**
   * Statistic Entity Resolvers
   */
  dataSources.statisticDataSource.createResolver(`${stack.stackName}StatisticTargetResolver`, createResolverProps('Statistic', 'target'));
};

export { createResolvers };
