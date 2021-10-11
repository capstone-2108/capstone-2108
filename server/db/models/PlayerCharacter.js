const Sequelize = require("sequelize");
const { db } = require("../db");

const PlayerCharacter = db.define("playerCharacter", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  health: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  strength: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  intelligence: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = { PlayerCharacter };
