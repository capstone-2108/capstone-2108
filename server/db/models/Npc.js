const Sequelize = require("sequelize");
const { db } = require("../db");

const Npc = db.define("npc", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  health: {
    type: Sequelize.INTEGER
  }
});

module.exports = { Npc };
