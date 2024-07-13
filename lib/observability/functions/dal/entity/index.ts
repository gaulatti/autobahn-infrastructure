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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      },
      lambda_arn: {
        type: DataTypes.STRING(110),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'targets',
      underscored: true,
    }
  );
};

/**
 * Defines the PerformanceExecution model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The PerformanceExecution model.
 */
const definePerformanceExecution = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'PerformanceExecution',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      providers_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      uuid: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(45),
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
      si: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cls: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tti: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      performance_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pleasantness_score: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      mode: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      ended_at: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
    },
    {
      tableName: 'performance_executions',
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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'schedules',
      underscored: true,
    }
  );
};

/**
 * Defines the PerformanceStatistic model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The PerformanceStatistic model.
 */
const definePerformanceStatistic = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'PerformanceStatistic',
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
      targets_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      type: {
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
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      n: {
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
      pleasantness_score: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      date_to: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'performance_statistics',
      underscored: true,
    }
  );
};

/**
 * Defines the BounceStatistic model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The BounceStatistic model.
 */
const defineBounceStatistic = (sequelize: Sequelize): ModelStatic<Model> => {
  return sequelize.define(
    'BounceStatistic',
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
      rate: {
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
    },
    {
      tableName: 'bounce_statistics',
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
      tableName: 'assignments',
      underscored: true,
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
        references: {
          model: 'targets',
          key: 'id',
        },
      },
      triggered_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      provider: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
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
      performance_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pleasantness_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'engagement',
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
  const Target = defineTarget(sequelize);
  const PerformanceExecution = definePerformanceExecution(sequelize);
  const Schedule = defineSchedule(sequelize);
  const PerformanceStatistic = definePerformanceStatistic(sequelize);
  const BounceStatistic = defineBounceStatistic(sequelize);
  const Assignment = defineAssignment(sequelize);
  const Beacon = defineBeacon(sequelize);
  const Engagement = defineEngagement(sequelize);

  // Define associations
  Project.belongsTo(Team, { foreignKey: 'teams_id' });
  Target.belongsTo(Project, { foreignKey: 'projects_id' });
  PerformanceExecution.belongsTo(Team, { foreignKey: 'teams_id' });
  PerformanceExecution.belongsTo(Target, { foreignKey: 'targets_id' });
  Schedule.belongsTo(Target, { foreignKey: 'targets_id' });
  PerformanceStatistic.belongsTo(Project, { foreignKey: 'projects_id' });
  PerformanceStatistic.belongsTo(Target, { foreignKey: 'targets_id' });
  BounceStatistic.belongsTo(Target, { foreignKey: 'targets_id' });
  Assignment.belongsTo(Project, { foreignKey: 'projects_id' });
  Assignment.belongsTo(User, { foreignKey: 'users_id' });
  Beacon.belongsTo(Team, { foreignKey: 'teams_id' });
  Beacon.belongsTo(Target, { foreignKey: 'targets_id' });
  Beacon.belongsTo(Assignment, { foreignKey: 'triggered_by' });
  Engagement.belongsTo(Target, { foreignKey: 'targets_id' });

  return {
    User,
    Team,
    Project,
    Target,
    PerformanceExecution,
    Schedule,
    PerformanceStatistic,
    BounceStatistic,
    Assignment,
    Beacon,
    Engagement,
  };
};

export { defineModels };
