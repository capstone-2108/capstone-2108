const Sequelize = require("sequelize");
const { db } = require("../db");

const TemplateCharacter = db.define("templateCharacter", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
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
  },
  baseIntelligence: {
    type: Sequelize.INTEGER,
    defaultValue: 100
  },
  portrait: {
    type: Sequelize.TEXT,
    defaultValue: "/images/NoImageAvailable.jpeg"
  }
});

module.exports = { TemplateCharacter };
