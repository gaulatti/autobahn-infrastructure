import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

/**
 * Defines the User model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The User model.
 */
const defineUser = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sub: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'users',
      underscored: true,
    }
  );
};

/**
 * Defines the Team model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Team model.
 */
const defineTeam = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Team',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'teams',
      underscored: true,
    }
  );
};

/**
 * Defines the Project model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Project model.
 */
const defineProject = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      teams_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'projects',
      underscored: true,
      timestamps: false,
    }
  );
};

/**
 * Defines the Membership model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Membership model.
 */
const defineMembership = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Membership',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      teams_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
      },
      users_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'memberships',
      underscored: true,
      timestamps: false,
    }
  );
};

/**
 * Defines the Target model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Target model.
 */
const defineTarget = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Target',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      projects_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      lambda_arn: {
        type: DataTypes.STRING(110),
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'targets',
      underscored: true,
    }
  );
};

/**
 * Defines the Assignment model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Assignment model.
 */
const defineAssignment = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Assignment',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      projects_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
      memberships_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'memberships',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'assignments',
      underscored: true,
      timestamps: false,
    }
  );
};

/**
 * Defines the Beacon model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Beacon model.
 */
const defineBeacon = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Beacon',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      teams_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
      },
      targets_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      triggered_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'assignments',
          key: 'id',
        },
      },
      uuid: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      provider: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ttfb: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      fcp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      dcl: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      lcp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tti: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      si: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      cls: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      mode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      screenshots: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      performance_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      accessibility_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      best_practices_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      seo_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pleasantness_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'beacons',
      underscored: true,
    }
  );
};

/**
 * Defines the Engagement model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Engagement model.
 */
const defineEngagement = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Engagement',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      targets_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      bounce_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_from: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_to: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'engagement',
      underscored: true,
    }
  );
};

/**
 * Defines the Schedule model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Schedule model.
 */
const defineSchedule = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Schedule',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      targets_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      provider: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cron: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      next_execution: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'schedules',
      underscored: true,
    }
  );
};

/**
 * Defines the Statistic model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The Statistic model.
 */
const defineStatistic = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'Statistic',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      targets_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      provider: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      period: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      statistic: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fcp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      lcp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tti: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      si: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cls: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      mode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      performance_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pleasantness_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      date_from: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      date_to: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'statistics',
      underscored: true,
    }
  );
};

/**
 * Defines the models for the database.
 *
 * @param sequelize - The Sequelize instance.
 * @returns An object containing the defined models.
 */
const defineModels = (sequelize: Sequelize) => {
  const User = defineUser(sequelize);
  const Team = defineTeam(sequelize);
  const Project = defineProject(sequelize);
  const Membership = defineMembership(sequelize);
  const Target = defineTarget(sequelize);
  const Assignment = defineAssignment(sequelize);
  const Beacon = defineBeacon(sequelize);
  const Engagement = defineEngagement(sequelize);
  const Schedule = defineSchedule(sequelize);
  const Statistic = defineStatistic(sequelize);

  // Define associations
  Project.belongsTo(Team, { foreignKey: 'teams_id' });
  Target.belongsTo(Project, { foreignKey: 'projects_id' });
  Assignment.belongsTo(Project, { foreignKey: 'projects_id' });
  Assignment.belongsTo(Membership, { foreignKey: 'memberships_id' });
  Beacon.belongsTo(Team, { foreignKey: 'teams_id' });
  Beacon.belongsTo(Target, { foreignKey: 'targets_id' });
  Beacon.belongsTo(Assignment, { foreignKey: 'triggered_by' });
  Engagement.belongsTo(Target, { foreignKey: 'targets_id' });
  Schedule.belongsTo(Target, { foreignKey: 'targets_id' });
  Statistic.belongsTo(Target, { foreignKey: 'targets_id' });

  /**
   * User Associations
   */
  Membership.belongsTo(Team, { foreignKey: 'teams_id', as: 'team' });
  Membership.belongsTo(User, { foreignKey: 'users_id', as: 'user' });
  Team.hasMany(Membership, { foreignKey: 'teams_id', as: 'memberships' });
  User.hasMany(Membership, { foreignKey: 'users_id', as: 'memberships' });

  return {
    User,
    Team,
    Project,
    Membership,
    Target,
    Assignment,
    Beacon,
    Engagement,
    Schedule,
    Statistic,
  };
};

export { defineModels };
