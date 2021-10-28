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
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalHealth: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  isAlive: {
    type: Sequelize.VIRTUAL,
    get: function () {
      return this.health > 0;
    }
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
 Instance Methods       *
 ***********************/
// Npc.prototype.re = function() {
//   this.health = this.totalHealth;
//   this.xPos = this.spawnX;
//   this.yPos = this.spawnY;
//   return this;
// }

/************************
 Model Methods          *
 ***********************/
Npc.getNearbyMonsters = async function (sceneId) {
  return this.findAll({
    attributes: ["id", "name", "health", "totalHealth"],
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
        where: {
          sceneId
        },
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }
    ]
  });
};

Npc.getMonster = async function (monsterId) {
  return this.findByPk(monsterId, {
    attributes: ["id", "name", "health"],
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
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }
    ]
  });
};

Npc.setAggroOn = async (npcId, playerCharacterId) => {
  const monster = await Npc.findByPk(npcId);
  if (!monster.aggroedOn && monster.isAlive) {
    monster.update({ aggroedOn: playerCharacterId });
    return true;
  }
  return false;
};

Npc.resetAggro = async (npcId) => {
  const monster = await Npc.findByPk(npcId);
  return monster.update({ aggroedOn: null });
};

Npc.resurrectDeadMonsters = async function () {
  const deadMonsters = await this.findAll({
    where: {
      health: {
        [Op.lte]: 0
      }
    },
    include: [
      {
        model: Location,
        attributes: { exclude: ["createdAt", "updatedAt"] }
      }
    ]
  });
  return Promise.all(
    deadMonsters.map((monster) =>
      monster.update({
        health: monster.totalHealth,
        aggroedOn: null,
        xPos: monster.spawnX,
        yPos: monster.spawnY
      })
    )
  );
};

Npc.applyDamage = async function (monsterId, damage) {
  // return await db.query('UPDATE npcs SET health = health - $damage WHERE npcs.id = $id returning id, health, "totalHealth", "isAlive"', {
  //   bind: {id: monsterId, damage},
  //   raw: true
  // });
  const monster = await this.findByPk(monsterId, {
    attributes: ["id", "health", "totalHealth", "isAlive"]
  });

  try {
    if (monster.health - damage < 0) {
      await monster.update({ health: 0 });
    } else {
      await monster.update({ health: monster.health - damage });
    }
  } catch (err) {
    await monster.update({ health: 0 });
  }

  return monster.reload({ attributes: ["id", "health", "totalHealth", "isAlive"] });
};

Npc.clearAllAggro = function () {
  db.query('UPDATE npcs SET "aggroedOn" = NULL');
};

module.exports = { Npc };
