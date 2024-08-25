import { Model, ModelStatic, Op, Transaction } from 'sequelize';
import { AllowedRequest, GetRequest, RequestType, UpdateHeartbeatRequest } from './types';
import { ListRequest } from './types/lists';
import { get } from 'lodash';

/**
 * Executes an operation based on the provided request.
 *
 * @param {Transaction} transaction - The database transaction.
 * @param {Record<string, ModelStatic<Model>>} models - The models used for querying the database.
 * @param {AllowedRequest} request - The request object containing the operation details.
 * @returns {Promise<any>} - A promise that resolves to the result of the operation.
 */
const executeOperation = async (transaction: Transaction, models: Record<string, ModelStatic<Model>>, request: AllowedRequest): Promise<any> => {
  const { User, Team, Project, Membership, Target, Assignment, Pulse, Heartbeat, Engagement, Schedule, Statistic, URL } = models;

  if (request.request_type.startsWith('List')) {
    const where: Record<string, any> = {};
    let paginationParams = {};

    const listRequest = request as ListRequest;
    if (listRequest.params) {
      const { startRow, endRow, sort, filters } = listRequest.params;

      const offset = parseInt(startRow!, 10);
      const limit = parseInt(endRow!, 10) - offset;
      const order: [string, string][] = [];

      if (sort.length) {
        sort.split(';').forEach((s) => {
          const splittedSort = s.split(',');
          order.push([splittedSort[0], splittedSort[1].toUpperCase()]);
        });
      }

      const filterCriteria = JSON.parse(filters);
      Object.keys(filterCriteria).forEach((field) => {
        const filter = filterCriteria[field];

        switch (filter.filterType) {
          case 'text':
            switch (filter.type) {
              case 'equals':
                where[field] = { [Op.eq]: filter.filter };
                break;
              case 'notEqual':
                where[field] = { [Op.ne]: filter.filter };
                break;
              case 'contains':
                where[field] = { [Op.like]: `%${filter.filter}%` };
                break;
              case 'notContains':
                where[field] = { [Op.notLike]: `%${filter.filter}%` };
                break;
              case 'startsWith':
                where[field] = { [Op.like]: `${filter.filter}%` };
                break;
              case 'endsWith':
                where[field] = { [Op.like]: `%${filter.filter}` };
                break;
              default:
                break;
            }
            break;

          case 'number':
            switch (filter.type) {
              case 'equals':
                where[field] = { [Op.eq]: filter.filter };
                break;
              case 'notEqual':
                where[field] = { [Op.ne]: filter.filter };
                break;
              case 'lessThan':
                where[field] = { [Op.lt]: filter.filter };
                break;
              case 'lessThanOrEqual':
                where[field] = { [Op.lte]: filter.filter };
                break;
              case 'greaterThan':
                where[field] = { [Op.gt]: filter.filter };
                break;
              case 'greaterThanOrEqual':
                where[field] = { [Op.gte]: filter.filter };
                break;
              case 'inRange':
                where[field] = { [Op.between]: [filter.filter, filter.filterTo] };
                break;
              default:
                break;
            }
            break;

          case 'date':
            switch (filter.type) {
              case 'equals':
                where[field] = { [Op.eq]: new Date(filter.dateFrom) };
                break;
              case 'notEqual':
                where[field] = { [Op.ne]: new Date(filter.dateFrom) };
                break;
              case 'lessThan':
                where[field] = { [Op.lt]: new Date(filter.dateFrom) };
                break;
              case 'lessThanOrEqual':
                where[field] = { [Op.lte]: new Date(filter.dateFrom) };
                break;
              case 'greaterThan':
                where[field] = { [Op.gt]: new Date(filter.dateFrom) };
                break;
              case 'greaterThanOrEqual':
                where[field] = { [Op.gte]: new Date(filter.dateFrom) };
                break;
              case 'inRange':
                where[field] = { [Op.between]: [new Date(filter.dateFrom), new Date(filter.dateTo)] };
                break;
              default:
                break;
            }
            break;

          case 'set':
            where[field] = { [Op.in]: filter.values };
            break;

          default:
            break;
        }
      });

      paginationParams = { offset, limit, order };
    }

    switch (request.request_type) {
      case RequestType.ListTeamsBySub:
        return Team.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListFeaturesBySub:
        return Team.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListProjects:
        return Project.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListProjectsByTeam:
        return Project.findAndCountAll({ ...paginationParams, transaction, where: { teams_id: listRequest.payload, ...where } });
      case RequestType.ListMemberships:
        return Membership.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListMembershipsByUser:
        return Membership.findAndCountAll({ ...paginationParams, transaction, where: { users_id: listRequest.payload, ...where } });
      case RequestType.ListMembershipsByUserWithTeam:
        return Membership.findAndCountAll({ ...paginationParams, transaction, where: { users_id: listRequest.payload, ...where }, include: [Team] });
      case RequestType.ListMembershipsByTeam:
        return Membership.findAndCountAll({ ...paginationParams, transaction, where: { teams_id: listRequest.payload, ...where } });
      case RequestType.ListAssignments:
        return Assignment.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListAssignmentsByProject:
        return Assignment.findAndCountAll({ ...paginationParams, transaction, where: { projects_id: listRequest.payload, ...where } });
      case RequestType.ListAssignmentsByMembership:
        return Assignment.findAndCountAll({ ...paginationParams, transaction, where: { memberships_id: listRequest.payload, ...where } });
      case RequestType.ListTargets:
        return Target.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListTargetsByProject:
        return Target.findAndCountAll({ ...paginationParams, transaction, where: { projects_id: listRequest.payload, ...where } });
      case RequestType.ListPulses:
        return Pulse.findAndCountAll({
          ...paginationParams,
          transaction,
          where,
          include: [
            { model: Heartbeat, as: 'heartbeats' },
            { model: URL, as: 'url' },
          ],
        });
      case RequestType.ListPulsesByTeam:
        return Pulse.findAndCountAll({
          ...paginationParams,
          transaction,
          where: { teams_id: listRequest.payload, ...where },
          include: [
            { model: Heartbeat, as: 'heartbeats' },
            { model: URL, as: 'url' },
          ],
        });
      case RequestType.ListPulsesByUser:
        return Pulse.findAndCountAll({
          ...paginationParams,
          transaction,
          where: { triggered_by: listRequest.payload, ...where },
          include: [
            { model: Heartbeat, as: 'heartbeats' },
            { model: URL, as: 'url' },
          ],
        });
      case RequestType.ListEngagements:
        return Engagement.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListEngagementsByURL:
        return Engagement.findAndCountAll({ ...paginationParams, transaction, where: { url_id: listRequest.payload, ...where } });
      case RequestType.ListSchedules:
        return Schedule.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListSchedulesByTarget:
        return Schedule.findAndCountAll({ ...paginationParams, transaction, where: { targets_id: listRequest.payload, ...where } });
      case RequestType.ListStatistics:
        return Statistic.findAndCountAll({ ...paginationParams, transaction, where });
      case RequestType.ListStatisticsByURL:
        return Statistic.findAndCountAll({ ...paginationParams, transaction, where: { url_id: listRequest.payload, ...where } });
      default:
        throw new Error(`Invalid LIST request: ${listRequest.request_type}`);
    }
  }

  if (request.request_type.startsWith('Get')) {
    const getRequest = request as GetRequest;
    switch (request.request_type) {
      case RequestType.GetURL:
        return URL.findOne({ transaction, where: { url: getRequest.payload } });
      case RequestType.GetURLByUUID:
        return URL.findOne({ transaction, where: { uuid: getRequest.payload } });
      case RequestType.GetUser:
        return User.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetUserByEmail:
        return User.findOne({ transaction, where: { email: getRequest.payload } });
      case RequestType.GetUserBySubWithMembershipAndTeam:
        return User.findOne({
          transaction,
          where: { sub: getRequest.payload },
          include: [
            {
              model: Membership,
              as: 'memberships',
              include: [
                {
                  model: Team,
                  as: 'team',
                },
              ],
            },
          ],
        });
      case RequestType.GetUserBySub:
        return User.findOne({ transaction, where: { sub: getRequest.payload } });
      case RequestType.GetTeam:
        return Team.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetProject:
        return Project.findOne({ transaction, where: { id: getRequest.payload } });

      /**
       * Memberships
       */
      case RequestType.GetMembership:
        return Membership.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetAssignment:
        return Assignment.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetTarget:
        return Target.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetPulse:
        return Pulse.findOne({
          transaction,
          where: { id: getRequest.payload },
          include: [
            { model: Heartbeat, as: 'heartbeats' },
            { model: URL, as: 'url' },
          ],
        });
      case RequestType.GetPulseByUUID:
        return Pulse.findOne({
          transaction,
          where: { uuid: getRequest.payload },
          include: [
            { model: Heartbeat, as: 'heartbeats' },
            { model: URL, as: 'url' },
          ],
        });
      case RequestType.GetEngagement:
        return Engagement.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetSchedule:
        return Schedule.findOne({ transaction, where: { id: getRequest.payload } });
      case RequestType.GetStatistic:
        return Statistic.findOne({ transaction, where: { id: getRequest.payload } });
      default:
        throw new Error(`Invalid GET request: ${getRequest.request_type}`);
    }
  }

  /**
   * Perform the operation based on the request type.
   */
  switch (request.request_type) {
    case RequestType.CreateURL:
      return URL.create({ transaction, ...request });
    case RequestType.CreateUser:
      return User.create({ transaction, ...request });
    case RequestType.CreateProject:
      return Project.create({ transaction, ...request });
    case RequestType.CreateMembership:
      return Membership.create({ transaction, ...request });
    case RequestType.CreateAssignment:
      return Assignment.create({ transaction, ...request });
    case RequestType.CreateTarget:
      return Target.create({ transaction, ...request });
    case RequestType.CreatePulse:
      return Pulse.create({ transaction, ...request });
    case RequestType.CreateHeartbeat:
      return Heartbeat.create({ transaction, ...request });
    case RequestType.UpdateHeartbeat:
      const updateHeartbeatRequest = request as UpdateHeartbeatRequest;
      return await (await Heartbeat.findOne({ transaction, where: { id: updateHeartbeatRequest.id } }))!.update({ transaction, ...updateHeartbeatRequest });
    case RequestType.CreateEngagement:
      return Engagement.create({ transaction, ...request });
    case RequestType.CreateSchedule:
      return Schedule.create({ transaction, ...request });
    case RequestType.CreateStatistic:
      return Statistic.create({ transaction, ...request });

    default:
      throw new Error(`Invalid request type: ${request.request_type}`);
  }
};

export { executeOperation };
