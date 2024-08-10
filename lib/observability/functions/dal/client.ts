import { InvokeCommand, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import { AllowedRequest, CreateAssignmentRequest, CreateBeaconRequest, CreateEngagementRequest, CreateMembershipRequest, CreateProjectRequest, CreateScheduleRequest, CreateStatisticRequest, CreateTargetRequest, CreateUserRequest, GetRequest, ListRenderingParams, ListRequest, RequestType, UpdateBeaconRequest } from './types';


/**
 * Represents a client for interacting with the Lambda service.
 */
const lambdaClient = new LambdaClient();

/**
 * Represents a decoder for decoding binary data.
 */
const decoder = new TextDecoder('utf-8');

/**
 * Represents a client for interacting with the data access layer.
 */
class DalClient {
  /**
   * Invokes a Lambda function with the given request.
   * @param request The request to send to the Lambda function.
   * @returns The response from the Lambda function.
   */
  private static async invoke(request: AllowedRequest): Promise<InvokeCommandOutput> {
    const invokeCommand = new InvokeCommand({
      FunctionName: process.env.DATA_ACCESS_ARN,
      Payload: JSON.stringify(request),
    });
    const response = await lambdaClient.send(invokeCommand);

    /**
     * If the DAL Lambda crashes, we all go down.
     */
    if (response.FunctionError) {
      const errorPayload = JSON.parse(Buffer.from(response.Payload!).toString());
      throw new Error(`Database Lambda Error: ${errorPayload.errorMessage}`);
    }

    return response;
  }

  /**
   * Parses the payload received as a Uint8Array and returns the parsed JSON object.
   *
   * @param payload - The payload to be parsed.
   * @returns The parsed JSON object.
   */
  private static parsePayload(payload: Uint8Array) {
    const responsePayload = decoder.decode(payload);
    return JSON.parse(responsePayload);
  }

  /**
   * Invokes the DalClient with the provided request and returns the parsed payload.
   * @param request The request to be invoked.
   * @returns The parsed payload.
   */
  private static async parsedInvoke(request: AllowedRequest) {
    const { Payload } = await DalClient.invoke(request);
    return DalClient.parsePayload(Payload!);
  }

  /**
   * Users
   */

  public static async getUser(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetUser,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getUserBySubWithMembershipAndTeam(payload: string) {
    const request: GetRequest = {
      request_type: RequestType.GetUserBySubWithMembershipAndTeam,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getUserBySub(payload: string) {
    const request: GetRequest = {
      request_type: RequestType.GetUserBySub,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getUserByEmail(payload: string) {
    const request: GetRequest = {
      request_type: RequestType.GetUserByEmail,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createUser(sub: string, email: string, name: string, last_name: string) {
    const request: CreateUserRequest = {
      request_type: RequestType.CreateUser,
      sub,
      email,
      name,
      last_name,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Teams
   */
  public static async listTeamsBySub(payload: string, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListTeamsBySub,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getTeam(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetTeam,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Features
   */
  public static async listFeaturesBySub(payload: string, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListFeaturesBySub,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Projects
   */
  public static async listProjects(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListProjects,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listProjectsByTeam(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListProjectsByTeam,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getProject(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetProject,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createProject(teams_id: number, name: string) {
    const request: CreateProjectRequest = {
      request_type: RequestType.CreateProject,
      teams_id,
      name,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Memberships
   */
  public static async listMemberships(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListMemberships,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listMembershipsByUser(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListMembershipsByUser,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listMembershipsWithTeamByUser(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListMembershipsByUserWithTeam,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listMembershipsByTeam(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListMembershipsByTeam,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getMembership(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetMembership,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createMembership(users_id: number, teams_id: number, role: number) {
    const request: CreateMembershipRequest = {
      request_type: RequestType.CreateMembership,
      users_id,
      teams_id,
      role,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Assignments
   */
  public static async listAssignments(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListAssignments,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listAssignmentsByProject(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListAssignmentsByProject,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listAssignmentsByMembership(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListAssignmentsByMembership,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getAssignment(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetAssignment,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createAssignment(projects_id: number, memberships_id: number, role: number) {
    const request: CreateAssignmentRequest = {
      request_type: RequestType.CreateAssignment,
      projects_id,
      memberships_id,
      role,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Targets
   */
  public static async listTargets(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListTargets,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listTargetsByProject(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListTargetsByProject,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getTarget(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetTarget,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createTarget(projects_id: number, stage: number, provider: number, name: string, url?: string, lambda_arn?: string) {
    const request: CreateTargetRequest = {
      request_type: RequestType.CreateTarget,
      projects_id,
      stage,
      provider,
      name,
      url,
      lambda_arn,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Beacons
   */
  public static async listBeacons(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListBeacons,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listBeaconsByTeam(payload: number[], params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListBeaconsByTeam,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listBeaconsByUser(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListBeaconsByUser,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getBeacon(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetBeacon,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getBeaconByUUID(payload: string) {
    const request: GetRequest = {
      request_type: RequestType.GetBeaconByUUID,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createBeacon(
    teams_id: number,
    stage: number,
    uuid: string,
    url: string,
    provider: number,
    type: number,
    mode: number,
    status: number,
    fcp?: number,
    lcp?: number,
    tti?: number,
    si?: number,
    cls?: number,
    performance_score?: number,
    pleasantness_score?: number,
    ended_at?: Date,
    targets_id?: number,
    triggered_by?: number
  ) {
    const request: CreateBeaconRequest = {
      request_type: RequestType.CreateBeacon,
      teams_id,
      stage,
      uuid,
      url,
      provider,
      type,
      fcp,
      lcp,
      tti,
      si,
      cls,
      mode,
      performance_score,
      ended_at,
      targets_id,
      triggered_by,
      pleasantness_score,
      status,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async updateBeacon(
    id: number,
    status: number,
    ttfb: number,
    fcp: number,
    dcl: number,
    lcp: number,
    tti: number,
    si: number,
    cls: number,
    performance_score: number,
    accessibility_score: number,
    best_practices_score: number,
    seo_score: number,
    screenshots?: { timestamp: number }[],
    pleasantness_score?: number,
    ended_at?: Date
  ) {
    const request: UpdateBeaconRequest = {
      request_type: RequestType.UpdateBeacon,
      id,
      performance_score,
      accessibility_score,
      best_practices_score,
      seo_score,
      pleasantness_score,
      ended_at,
      status,
      ttfb,
      fcp,
      dcl,
      lcp,
      tti,
      si,
      cls,
      screenshots,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Engagements
   */

  public static async listEngagements(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListEngagements,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listEngagementsByTarget(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListEngagementsByTarget,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getEngagement(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetEngagement,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createEngagement(targets_id: number, bounce_rate: number, mode: number, date_from: Date, date_to: Date) {
    const request: CreateEngagementRequest = {
      request_type: RequestType.CreateEngagement,
      targets_id,
      bounce_rate,
      mode,
      date_from,
      date_to,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Schedules
   */

  public static async listSchedules(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListSchedules,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listSchedulesByTarget(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListSchedulesByTarget,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getSchedule(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetSchedule,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createSchedule(targets_id: number, provider: number, cron: string, next_execution: Date) {
    const request: CreateScheduleRequest = {
      request_type: RequestType.CreateSchedule,
      targets_id,
      provider,
      cron,
      next_execution,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Statistics
   */
  public static async listStatistics(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListStatistics,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listStatisticsByTarget(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListStatisticsByTarget,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getStatistic(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetStatistic,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createStatistic(
    targets_id: number,
    provider: number,
    period: number,
    statistic: number,
    fcp: number,
    lcp: number,
    tti: number,
    si: number,
    cls: number,
    mode: number,
    count: number,
    performance_score: number,
    date_from: Date,
    date_to: Date,
    pleasantness_score?: number
  ) {
    const request: CreateStatisticRequest = {
      request_type: RequestType.CreateStatistic,
      targets_id,
      provider,
      period,
      statistic,
      fcp,
      lcp,
      tti,
      si,
      cls,
      mode,
      count,
      performance_score,
      date_from,
      date_to,
      pleasantness_score,
    };

    return await DalClient.parsedInvoke(request);
  }
}

export { DalClient };
