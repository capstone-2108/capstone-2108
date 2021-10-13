const Sequelize = require("sequelize");
const { db } = require("../db");

const Location = db.define("location", {
  xPos: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  yPos: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  facingDirection: {
    type: Sequelize.ENUM("n", "s", "e", "w", "ne", "nw", "se", "sw"),
    allowNull: false
  }
});

module.exports = { Location };
