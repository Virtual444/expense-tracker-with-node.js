const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const DownloadHistory = sequelize.define("downloadHistory", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  downloadedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  downloadedFileUrl: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

module.exports = DownloadHistory;
