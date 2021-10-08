const Sequelize = require("sequelize");
const { db } = require("../db");

const Npc = db.define("npc", {
  health: {
    type: Sequelize.INTEGER
  }
});

module.exports = { Npc };
