const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define ('users', {
   
     id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey:true


     },

     name: {
        type: Sequelize.STRING,
        allowNull: false
     },

     email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique:true  
     },


     password:{
        type: Sequelize.STRING,
        allowNull: false
     },

     totalExpenses: {
      type:Sequelize.FLOAT,
      defaultValue: 0,
    }
     

});

module.exports = User;