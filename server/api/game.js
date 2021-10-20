const { requireTokenMiddleware } = require("../auth-middleware");
const router = require("express").Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser(process.env.cookieSecret));
const { worldChat, gameSync } = require("../socket");
const {
  TemplateCharacter,
  SpriteSheet,
  Location,
  PlayerCharacter,
  Scene,
  Npc
} = require("../db");

//This fetches all template characters
router.get("/templates", async (req, res, next) => {
  try {
    const result = await TemplateCharacter.findAll();
    res.json(result);
  } catch {
    next(err);
  }
});

router.get("/character/:id", requireTokenMiddleware, async (req, res, next) => {
  const playerCharacter = await PlayerCharacter.findOne({
    where: {
      id: req.params.id
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
  const payload = {
    // userId: req.user.id,
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
  res.json(payload);
});

//gets called if user is LOGGING IN (pulling their playerCharacter info)
router.get("/character", requireTokenMiddleware, async (req, res, next) => {
  try {
    const playerCharacter = await PlayerCharacter.findOne({
      where: {
        userId: req.user.id
      },
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
          attributes: {exclude: ["createdAt", "updatedAt"]},
          include: {
            model: Scene,
            attributes: ["id", "name"]
          }
        }
      ]
    });
    await playerCharacter.update({active: true});
    const payload = {
      userId: req.user.id,
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
      sceneName: playerCharacter.location.scene.name
    };
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

  }
  catch(err) {
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
      facingDirection: "e",
      sceneId: 1
    });
    const scene = await location.getScene();

    //create newplayer in PlayerCharacter instance
    const newPlayer = await PlayerCharacter.create({
      name: req.body.name,
      totalHealth: req.body.character.baseHealth,
      health: req.body.character.baseHealth,
      strength: req.body.character.baseStrength,
      intelligence: req.body.character.baseIntelligence,
      locationId: location.id
    });

    await newPlayer.setUser(req.user);
    await newPlayer.setTemplateCharacter(req.body.character.id);

    const templateCharacterInfo = await newPlayer.getTemplateCharacter();
    const spriteSheetInfo = await templateCharacterInfo.getSpriteSheets();

    const payload = {
      userId: req.user.id,
      characterId: newPlayer.id,
      name: newPlayer.name,
      templateName: templateCharacterInfo.name,
      health: newPlayer.health,
      totalHealth: newPlayer.totalHealth,
      gold: newPlayer.gold,
      spriteSheetImageUrl: spriteSheetInfo[0].spriteSheet_image_url,
      spriteSheetJsonUrl: spriteSheetInfo[0].spriteSheet_json_url,
      xPos: location.xPos,
      yPos: location.yPos,
      facingDirection: location.facingDirection,
      scene: scene.name
    };
    res.json(payload);
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
      payload[i] = {
        userId: req.user.id,
        characterId: playerCharacter.id,
        name: playerCharacter.name,
        health: playerCharacter.health,
        templateName: playerCharacter.templateCharacter.name,
        spriteSheetImageUrl:
          playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
        spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
        xPos: playerCharacter.location.xPos,
        yPos: playerCharacter.location.yPos,
        facingDirection: playerCharacter.location.facingDirection
      };
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
        templateName: monster.templateCharacter.name,
        spriteSheetImageUrl: monster.templateCharacter.spriteSheets[0].spriteSheet_image_url,
        spriteSheetJsonUrl: monster.templateCharacter.spriteSheets[0].spriteSheet_image_url,
        xPos: monster.location.xPos,
        yPos: monster.location.yPos,
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
    if(playerCharacter) {
      worldChat.emit("newMessage", {
        channel: "world",
        message: {
          name: "WORLD", //todo: change this to the person's character name
          message: playerCharacter.name + " has logged out!"
        }
      });
      gameSync.emit('remotePlayerLogout', playerCharacter.id);
      res.sendStatus(200);
    }
    else {
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
