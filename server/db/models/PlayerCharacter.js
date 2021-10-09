const Sequelize = require("sequelize");
const { db } = require("../db");

const Character = db.define("character", {
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
