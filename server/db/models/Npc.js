const Sequelize = require("sequelize");
const { db } = require("../db");
const { Op } = require("sequelize");
const { TemplateCharacter } = require("./TemplateCharacter");
const { SpriteSheet } = require("./SpriteSheet");
const { Location } = require("./Location");

const Npc = db.define("npc", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  health: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  totalHealth: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  hostile: {
    type: Sequelize.BOOLEAN,
    default: true
  }
});

/************************
 Model Methods          *
 ***********************/
Npc.getNearbyMonsters = async function (sceneId) {
  return this.findAll({
    attributes: ["id", "name", "health"],
    include: [
      {
        model: TemplateCharacter,
        attributes: ["id", "name"],
        include: {
          model: SpriteSheet,
          attributes: ["name", "spriteSheet_image_url", "spriteSheet_json_url"]
        }
      },
      {
        model: Location,
        where: {
          sceneId
        },
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }
    ]
  });
};

module.exports = { Npc };
