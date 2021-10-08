const Sequelize = require("sequelize");
const { db } = require("../db");

const Map = db.define("map", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = { Map };
