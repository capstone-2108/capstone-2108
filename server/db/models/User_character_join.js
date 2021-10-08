const Sequelize = require("sequelize");
const { db } = require("../db");

const User_character_join = db.define("user_character_join", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  health: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = { User_character_join };
