const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const forgotPasswordRequest = sequelize.define("forgotPasswordRequest", {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

module.exports = forgotPasswordRequest;
