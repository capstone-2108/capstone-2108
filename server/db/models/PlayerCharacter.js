const Sequelize = require("sequelize");
const { db } = require("../db");
const { Op } = require("sequelize");
const { TemplateCharacter } = require("./TemplateCharacter");
const { SpriteSheet } = require("./SpriteSheet");
const { Location } = require("./Location");
const {Scene} = require('./Scene');
const {Npc} = require('./Npc');
const {User} = require('./User');

const PlayerCharacter = db.define("playerCharacter", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  health: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
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
  expToNextLevel: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1000
  },
  isAlive: {
    type: Sequelize.VIRTUAL,
    get: function() {
      return this.health > 0;
    }
  },
});

/************************
 Instance Methods       *
 ***********************/
PlayerCharacter.prototype.getDamage = function() {
  return Math.floor(this.templateCharacter.baseStrength / 2);
}

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
      },
      attributes: ["id", "name", "health", "totalHealth"],
      include: [
        {
          model: User,
          attributes: ["firstName"],
          where: {
            loggedIn: true
          }
        },
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

PlayerCharacter.getMainCharacterFromUser = function (userId) {
  return this.findOne({
    where: {
      userId: userId
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
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: {
          model: Scene,
          attributes: ["id", "name"]
        }
      }
    ]
  });
}

PlayerCharacter.getCharacter = function (characterId) {
  //@todo: if the user id is included, then include it in the return payload
  return this.findByPk(characterId, {
    include: [
      {
        model: TemplateCharacter,
        attributes: ["id", "name", "portrait", "baseStrength"],
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

PlayerCharacter.getStaleLoggedInUsers = function () {
  return this.findAll({
    include: [
      {
        model: User,
        where: {
          loggedIn: true,
          lastSeen: {
            [Op.lte]: new Date(Date.now() - 45000).toISOString()
          }
        },
      },
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

// PlayerCharacter.applyDamage = async function (characterId, damage) {
//   return await db.query('UPDATE "playerCharacters" SET health = health - $damage WHERE id = $id returning id, health, "totalHealth"', {
//     bind: {id: characterId, damage},
//     logging: true
//   });
// }

PlayerCharacter.applyDamage = async function (characterId, damage) {
  const character = await this.findByPk(characterId, {
    attributes: ["id", "health", "totalHealth", "isAlive"],
    include: [
      {
        model: Location,
        attributes: ["spawnX", "spawnY"],
      }
    ]
  });

  try {
    if ((character.health - damage) < 0) {
      await character.update({health: 0});
    }
    else {
      await character.update({health: character.health - damage});
    }
  }
  catch(err) {
    console.log(err);
    await character.update({health: 0});
  }
  const payload = {
    id: character.id,
    health: character.health,
    totalHealth: character.totalHealth,
    isAlive: character.isAlive,
    spawnX: character.location.spawnX,
    spawnY: character.location.spawnY
  }
  if(!character.isAlive) {
    payload.reviveHealth = Math.floor(character.totalHealth * .3)
    await character.update({health: payload.reviveHealth});
  }
  return payload;
}

PlayerCharacter.resetAggroOnPlayerCharacter = async function(characterId) {
  return Npc.update({aggroedOn: null}, {
    where: {
      aggroedOn: characterId
    },
    returning: true
  });
  // return await Promise.all(aggroedMonsters.map(monster => monster.update({aggroedOn: null}, {returning: true})));
}


/************************
 Helper Functions       *
 ***********************/
const transformToPayload = (playerCharacter) => {
  return {
    characterId: playerCharacter.id,
    name: playerCharacter.name,
    health: playerCharacter.health,
    totalHealth: playerCharacter.totalHealth,
    experience: playerCharacter.experience,
    expToNextLevel: playerCharacter.expToNextLevel,
    level: playerCharacter.level,
    templateName: playerCharacter.templateCharacter.name,
    spriteSheetImageUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_json_url,
    xPos: playerCharacter.location.xPos,
    yPos: playerCharacter.location.yPos,
    spawnX: playerCharacter.location.spawnX,
    spawnY: playerCharacter.location.spawnY,
    gold: playerCharacter.gold,
    sceneId: playerCharacter.location.scene.id,
    sceneName: playerCharacter.location.scene.name,
    portrait: playerCharacter.templateCharacter.portrait
  };
}

const transformToNearbyPlayerPayload = (user, playerCharacter) => {
  return {
    userId: user.id,
    characterId: playerCharacter.id,
    name: playerCharacter.name,
    health: playerCharacter.health,
    totalHealth: playerCharacter.totalHealth,
    portrait: playerCharacter.templateCharacter.portrait,
    templateName: playerCharacter.templateCharacter.name,
    spriteSheetImageUrl:
    playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    xPos: playerCharacter.location.xPos,
    yPos: playerCharacter.location.yPos,
    spawnX: playerCharacter.location.spawnX,
    spawnY: playerCharacter.location.spawnY,
    facingDirection: playerCharacter.location.facingDirection
  };
}

module.exports = { PlayerCharacter, transformToPayload, transformToNearbyPlayerPayload };
