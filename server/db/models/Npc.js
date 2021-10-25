const Sequelize = require("sequelize");
const { db } = require("../db");
const { Op } = require("sequelize");
const { TemplateCharacter } = require("./TemplateCharacter");
const { SpriteSheet } = require("./SpriteSheet");
const { Location } = require("./Location");
const chalk = require("chalk");

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
    //only monsters which are hostile should have an aggro zone created around them
    type: Sequelize.BOOLEAN,
    default: true
  },
  aggroedOn: {
    //this is the player the monster is currently aggroed on
    type: Sequelize.INTEGER
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

Npc.getMonster = async function (monsterId) {
  return this.findByPk(monsterId,{
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

Npc.setAggroOn = async (npcId, playerCharacterId) => {
  const monster = await Npc.findByPk(npcId);
  if (!monster.aggroedOn) {
    monster.update({ aggroedOn: playerCharacterId });
    return true;
  }
  return false;
};

Npc.resetAggro = async (npcId) => {
  const monster = await Npc.findByPk(npcId);
  return monster.update({ aggroedOn: null });
};

Npc.applyDamage = async (monsterId, damage) => {
  return await db.query('UPDATE npcs SET health = health - $damage WHERE npcs.id = $id returning id, health, "totalHealth"', {
    bind: {id: monsterId, damage}
  });
}

Npc.clearAllAggro = function() {
  db.query('UPDATE npcs SET "aggroedOn" = NULL');
}

module.exports = { Npc };
