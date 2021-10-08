const Sequelize = require("sequelize");
const { db } = require("../db");

const TemplateCharacter = db.define("templateCharacter", {
  baseStrength: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  isPlayable: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  baseHealth: {
    type: Sequelize.INTEGER,
    defaultValue: 100
  }
});

module.exports = { TemplateCharacter };
