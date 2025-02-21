const { requireTokenMiddleware } = require("../auth-middleware");
const router = require("express").Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser(process.env.cookieSecret));
const { worldChat, gameSync } = require("../socket");
const { TemplateCharacter, SpriteSheet, Location, PlayerCharacter, Scene, Npc } = require("../db");
const { transformToPayload, transformToNearbyPlayerPayload} = require("../db/models/PlayerCharacter");
const chalk = require("chalk");
const {Sequelize} = require('sequelize');
const sequelize = require('sequelize');

//This fetches all template characters
router.get("/templates", async (req, res, next) => {
  try {
    const result = await TemplateCharacter.findAll({
      where: {
        isPlayable: true
      }
    });
    res.json(result);
  } catch {
    next(err);
  }
});

router.get("/character/:id", requireTokenMiddleware, async (req, res, next) => {
  try {
    console.log(chalk.red("req.params.id", req.params.id));
    const playerCharacter = await PlayerCharacter.getCharacter(req.params.id);
    res.json(transformToPayload(playerCharacter));
  } catch (err) {
    next(err);
  }
});

//gets called if user is LOGGING IN (pulling their playerCharacter info)
router.get("/character", requireTokenMiddleware, async (req, res, next) => {
  try {
    const playerCharacter = await PlayerCharacter.getMainCharacterFromUser(req.user.id);
    await playerCharacter.update({ active: true });
    const payload = transformToPayload(playerCharacter);
    payload.userId = req.user.id;
    res.json(payload);

    // Tell the world this player has joined!
    worldChat.emit("newMessage", {
      channel: "world",
      message: {
        name: "WORLD", //todo: change this to the person's character name
        message: playerCharacter.name + " has logged in!"
      }
    });

    gameSync.emit("remotePlayerLoad", payload);
  } catch (err) {
    next(err);
  }
});

//POST /api/character - creates a new character
router.post("/character", requireTokenMiddleware, async (req, res, next) => {
  try {
    //create new entry in location table for this new character
    const location = await Location.create({
      xPos: 300,
      yPos: 500,
      spawnX: 300,
      spawnY: 500,
      facingDirection: "e",
      sceneId: 1
    });
    const scene = await location.getScene();
    console.log(scene);

    //create newplayer in PlayerCharacter instance
    const newPlayer = await PlayerCharacter.create({
      name: req.body.name,
      totalHealth: req.body.character.baseHealth,
      health: req.body.character.baseHealth,
      strength: req.body.character.baseStrength,
      intelligence: req.body.character.baseIntelligence,
      locationId: location.id,
      active: true
    });

    await newPlayer.setUser(req.user);
    await newPlayer.setTemplateCharacter(req.body.character.id);

    const templateCharacterInfo = await newPlayer.getTemplateCharacter();
    const spriteSheetInfo = await templateCharacterInfo.getSpriteSheets();
    await req.user.flagLoggedIn();

    const payload = {
      userId: req.user.id,
      characterId: newPlayer.id,
      name: newPlayer.name,
      templateName: templateCharacterInfo.name,
      health: newPlayer.health,
      totalHealth: newPlayer.totalHealth,
      gold: newPlayer.gold,
      experience: newPlayer.experience,
      expToNextLevel: newPlayer.expToNextLevel,
      spriteSheetImageUrl: spriteSheetInfo[0].spriteSheet_image_url,
      spriteSheetJsonUrl: spriteSheetInfo[0].spriteSheet_json_url,
      xPos: location.xPos,
      yPos: location.yPos,
      spawnX: location.spawnX,
      spawnY: location.spawnY,
      facingDirection: location.facingDirection,
      sceneName: scene.name,
      sceneId: location.sceneId,
      sceneDisplayName: scene.displayName,
      portrait: templateCharacterInfo.portrait
    };
    res.json(payload);
    gameSync.emit("remotePlayerLoad", payload);
    // Tell the world this player has joined!
    worldChat.emit("newMessage", {
      channel: "world",
      message: {
        name: "WORLD", //todo: change this to the person's character name
        message: newPlayer.name + " has logged in!"
      }
    });
  } catch (err) {
    next(err);
  }
});

//get /api/game/character/nearby - fetches all characters nearby this character
router.get("/character/:characterId/nearby", requireTokenMiddleware, async (req, res, next) => {
  try {
    const playerCharacters = await PlayerCharacter.getNearbyPlayers(req.params.characterId);
    const payload = [];
    let i = 0;
    let len = playerCharacters.length;
    for (; i < len; i++) {
      const playerCharacter = playerCharacters[i];
      payload[i] = transformToNearbyPlayerPayload(req.user, playerCharacter);
    }
    res.json(payload);
  } catch (err) {
    console.log(err);
  }
});

//get /api/game/character/nearby - fetches all npc's in a given scene
router.get("/monster/scene/:sceneId", requireTokenMiddleware, async (req, res, next) => {
  try {
    const monsters = await Npc.getNearbyMonsters(req.params.sceneId);
    const payload = [];
    let i = 0;
    let len = monsters.length;
    for (; i < len; i++) {
      const monster = monsters[i];
      payload[i] = {
        monsterId: monster.id,
        name: monster.name,
        health: monster.health,
        totalHealth: monster.totalHealth,
        templateName: monster.templateCharacter.name,
        portrait: monster.templateCharacter.portrait,
        spriteSheetImageUrl: monster.templateCharacter.spriteSheets[0].spriteSheet_image_url,
        spriteSheetJsonUrl: monster.templateCharacter.spriteSheets[0].spriteSheet_image_url,
        xPos: monster.location.xPos,
        yPos: monster.location.yPos,
        spawnX: monster.location.spawnX,
        spawnY: monster.location.spawnY,
        facingDirection: monster.location.facingDirection
      };
    }
    res.json(payload);
  } catch (err) {
    console.log(err);
  }
});

router.put("/character/:characterId/logout", requireTokenMiddleware, async (req, res, next) => {
  try {
    const playerCharacter = await PlayerCharacter.logout(req.user.id, req.params.characterId);
    if (playerCharacter) {
      await PlayerCharacter.resetAggroOnPlayerCharacter(playerCharacter.id);
      worldChat.emit("newMessage", {
        channel: "world",
        message: {
          name: "WORLD", //todo: change this to the person's character name
          message: playerCharacter.name + " has logged out!"
        }
      });
      gameSync.emit("remotePlayerLogout", playerCharacter.id);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    next(err);
  }
});

// router.get("/character/:id", requireTokenMiddleware, async (req, res, next) => {
//   //@todo: make sure the player can only load characters belonging to them

//   const { id } = req.params;
//   // const hasCharacter = await req.user.hasPlayerCharacter(id);
//   let playerCharacter = [];
//   // if (hasCharacter) {
//   playerCharacter = (
//     await req.user.getPlayerCharacters({
//       // where: { id },
//       // add other fields totalHealth,
//       attributes: ["id", "name", "health", "gold"],
//       include: [
//         {
//           model: TemplateCharacter,
//           attributes: ["id", "name"],
//           include: {
//             model: SpriteSheet,
//             attributes: ["name", "spriteSheet_image_url", "spriteSheet_json_url"]
//           }
//         },
//         {
//           model: Location,
//           attributes: { exclude: ["createdAt", "updatedAt"] },
//           include: {
//             model: Scene,
//             attributes: ["name"]
//           }
//         }
//       ]
//     })
//   )[0];
//   // } else {
//   //   res.sendStatus(404);
//   // }
//   const payload = {
//     userId: req.user.id,
//     characterId: playerCharacter.id,
//     id: playerCharacter.id,
//     name: playerCharacter.name,
//     health: playerCharacter.health,
//     templateName: playerCharacter.templateCharacter.name,
//     spriteSheetImageUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
//     spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_json_url,
//     xPos: playerCharacter.location.xPos,
//     yPos: playerCharacter.location.yPos,
//     gold: playerCharacter.gold
//   };

//   res.json(payload);

//   // Tell the world this player has joined!
//   worldChat.emit("newMessage", {
//     channel: "world",
//     message: {
//       name: "WORLD", //todo: change this to the person's character name
//       message: playerCharacter.name + " has logged in!"
//     }
//   });

//   gameSync.emit("otherPlayerLoad", payload);
// });

router.get("/monster/:id", async (req, res, next) => {
  try {
    const monster = await Npc.findOne({
      where: {
        id: req.params.id
      }
    });
    res.json(monster);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
