const Sequelize = require("sequelize");
const { db } = require("../db");
const { Op } = require("sequelize");
const { TemplateCharacter } = require("./TemplateCharacter");
const { SpriteSheet } = require("./SpriteSheet");
const { Location } = require("./Location");
const {Scene} = require('./Scene');

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
  },
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

PlayerCharacter.getCharacter = function (characterId) {
  //@todo: if the user id is included, then include it in the return payload
  return this.findOne({
    where: {
      id: characterId
    },
    include: [
      {
        model: TemplateCharacter,
        attributes: ["id", "name", "portrait"],
        include: {
          model: SpriteSheet,
          attributes: ["name", "spriteSheet_image_url", "spriteSheet_json_url"]
        }
      },
      {
        model: Location,
        attributes: {exclude: ["createdAt", "updatedAt"]},
        include: {
          model: Scene,
          attributes: ["id", "name"]
        }
      }
    ]
  });
}



PlayerCharacter.logout = async function (userId, characterId) {
  let playerCharacter = await PlayerCharacter.findAll({
    where: {
      id: characterId,
      userId
    }
  });
  if (playerCharacter.length) {
    playerCharacter = playerCharacter[0];
    playerCharacter.update({ active: false });
  }
  return playerCharacter;
};


/************************
 Helper Functions       *
 ***********************/
const transformToPayload = (playerCharacter) => {
  return {
    characterId: playerCharacter.id,
    id: playerCharacter.id,
    name: playerCharacter.name,
    health: playerCharacter.health,
    experience: playerCharacter.experience,
    level: playerCharacter.level,
    templateName: playerCharacter.templateCharacter.name,
    spriteSheetImageUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_json_url,
    xPos: playerCharacter.location.xPos,
    yPos: playerCharacter.location.yPos,
    gold: playerCharacter.gold,
    sceneId: playerCharacter.location.scene.id,
    sceneName: playerCharacter.location.scene.name,
    portrait: playerCharacter.templateCharacter.portrait
  };
}

module.exports = { PlayerCharacter, transformToPayload };
