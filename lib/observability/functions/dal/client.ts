import { InvokeCommand, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import {
  AllowedRequest,
  CreateAssignmentRequest,
  CreatePulseRequest,
  CreateHeartbeatRequest,
  CreateEngagementRequest,
  CreateMembershipRequest,
  CreateProjectRequest,
  CreateScheduleRequest,
  CreateStatisticRequest,
  CreateTargetRequest,
  CreateUserRequest,
  GetRequest,
  ListRenderingParams,
  ListRequest,
  RequestType,
  UpdateHeartbeatRequest,
} from './types';

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

  public static async createTarget(projects_id: number, stage: number, provider: number, name: string, url_id?: number, lambda_arn?: string) {
    const request: CreateTargetRequest = {
      request_type: RequestType.CreateTarget,
      projects_id,
      stage,
      provider,
      name,
      url_id,
      lambda_arn,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Pulses
   */
  public static async listPulses(params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListPulses,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listPulsesByTeam(payload: number[], params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListPulsesByTeam,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async listPulsesByUser(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListPulsesByUser,
      payload,
      params,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getPulse(payload: number) {
    const request: GetRequest = {
      request_type: RequestType.GetPulse,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async getPulseByUUID(payload: string) {
    const request: GetRequest = {
      request_type: RequestType.GetPulseByUUID,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async createPulse(
    teams_id: number,
    stage: number,
    uuid: string,
    url_id: number,
    provider: number,
    ownership: { triggered_by?: number; targets_id?: number }
  ) {
    const request: CreatePulseRequest = {
      request_type: RequestType.CreatePulse,
      teams_id,
      uuid,
      stage,
      url_id,
      provider,
      ...ownership,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Heartbeats
   */
  public static async createHeartbeat(mode: number, pulses_id: number) {
    const request: CreateHeartbeatRequest = {
      request_type: RequestType.CreateHeartbeat,
      pulses_id,
      mode,
      status: 0,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async updateHeartbeat(
    id: number,
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
    status: number,
    screenshots?: { timestamp: number }[],
    ended_at?: Date
  ) {
    const request: UpdateHeartbeatRequest = {
      request_type: RequestType.UpdateHeartbeat,
      id,
      status,
      ttfb,
      fcp,
      dcl,
      lcp,
      tti,
      si,
      cls,
      performance_score,
      accessibility_score,
      best_practices_score,
      seo_score,
      screenshots,
      ended_at,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async updateHeartbeatRetries(id: number, retries: number) {
    const request: UpdateHeartbeatRequest = {
      request_type: RequestType.UpdateHeartbeat,
      id,
      retries,
      status: 6,
    };

    return await DalClient.parsedInvoke(request);
  }

  public static async updateFailedHeartbeat(id: number, retries: number) {
    const request: UpdateHeartbeatRequest = {
      request_type: RequestType.UpdateHeartbeat,
      id,
      retries,
      status: 5,
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

  public static async listEngagementsByURL(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListEngagementsByURL,
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

  public static async createEngagement(url_id: number, bounce_rate: number, mode: number, date_from: Date, date_to: Date) {
    const request: CreateEngagementRequest = {
      request_type: RequestType.CreateEngagement,
      url_id,
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

  public static async listStatisticsByURL(payload: number, params: ListRenderingParams) {
    const request: ListRequest = {
      request_type: RequestType.ListStatisticsByURL,
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
    url_id: number,
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
    date_to: Date
  ) {
    const request: CreateStatisticRequest = {
      request_type: RequestType.CreateStatistic,
      url_id,
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
    };

    return await DalClient.parsedInvoke(request);
  }
}

export { DalClient };
