const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define ('user', {
   
     id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey:true


     },

     name: {
        type: Sequelize.STRING,
        unique:true,
        allowNull: false
     },

     password:{
        type: Sequelize.STRING,
        allowNull: false
     }

});

module.exports = User;