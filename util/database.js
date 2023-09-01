const Sequelize = require('sequelize');

const sequelize = new Sequelize ('expense_tracker_nodejs', 'root', '0000', {
  
    dialect: 'mysql',
    host: 'localhost',
    logging: console.log,

});

module.exports = sequelize;