const Sequelize = require("sequelize");
const { db } = require("../db");

const SpriteSheet = db.define("spriteSheet", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  spriteSheet_image_url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  spriteSheet_json_url: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = { SpriteSheet };
