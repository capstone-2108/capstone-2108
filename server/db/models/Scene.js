const Sequelize = require("sequelize");
const { db } = require("../db");

const Scene = db.define("scene", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = { Scene };
