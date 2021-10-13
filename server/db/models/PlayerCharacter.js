const Sequelize = require("sequelize");
const { db } = require("../db");
const { Op } = require("sequelize");
const { TemplateCharacter } = require("./TemplateCharacter");
const { SpriteSheet } = require("./SpriteSheet");
const { Location } = require("./Location");

const PlayerCharacter = db.define("playerCharacter", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  health: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  totalHealth: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  strength: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  intelligence: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  gold: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

/************************
 Model Methods          *
 ***********************/
PlayerCharacter.getNearbyPlayers = async function (characterId) {
  let nearbyPlayers = [];
  const character = await this.findByPk(characterId);
  if (character) {
    const location = await character.getLocation();
    nearbyPlayers = this.findAll({
      where: {
        id: {
          [Op.ne]: characterId
        }
      },
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
            sceneId: location.sceneId
          },
          attributes: { exclude: ["createdAt", "updatedAt"] }
        }
      ]
    });
  }
  return nearbyPlayers;
};

module.exports = { PlayerCharacter };
