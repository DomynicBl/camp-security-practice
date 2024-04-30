// models/User.js
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../sequelize');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
},{
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.hash(user.password, await bcrypt.genSalt(10)); // Criptografando a senha antes de salvar no banco
      user.password = salt;
    }
  }
});

module.exports = User;