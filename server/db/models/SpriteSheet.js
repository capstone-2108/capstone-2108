const Sequelize = require("sequelize");
const { db } = require("../db");

const SpriteSheet = db.define("spriteSheet", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  spriteSheet_url: {
    type: Sequelize.TEXT,
    allowNull: false
  }
});

module.exports = { SpriteSheet };
