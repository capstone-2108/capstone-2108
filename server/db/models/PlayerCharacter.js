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
    allowNull: false
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
  },
  level: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  experience: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
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
        },
        active: true
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

PlayerCharacter.logout = async function (userId, characterId) {
  let playerCharacter = await PlayerCharacter.findAll({
    where: {
      id: characterId,
      userId
    }
  });
  console.log('playerCharacter', playerCharacter);
  if (playerCharacter.length) {
    playerCharacter = playerCharacter[0];
    playerCharacter.update({ active: false });
  }
  return playerCharacter;
};

module.exports = { PlayerCharacter };
