import { DataTypes, Sequelize } from 'sequelize';

/**
 * Defines the User model in the database.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @returns {Model} The User model.
 */
const defineUser = (sequelize: Sequelize) => {
  const User = sequelize.define(
    'User',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'users',
    }
  );

  return User;
};

/**
 * Defines the models for the database.
 *
 * @param sequelize - The Sequelize instance.
 * @returns An object containing the defined models.
 */
const defineModels = (sequelize: Sequelize) => {
  const User = defineUser(sequelize);

  return { User };
};
export { defineModels };
