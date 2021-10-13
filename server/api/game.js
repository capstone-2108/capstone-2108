const { requireTokenMiddleware } = require("../auth-middleware");
const router = require("express").Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser(process.env.cookieSecret));
const { worldChat, gameSync } = require("../socket/index");
const { TemplateCharacter, SpriteSheet, Location, User, PlayerCharacter } = require("../db");
const { Op } = require("sequelize");

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

//get /api/game/character/:id - fetches character data by id
router.get("/character/:id", requireTokenMiddleware, async (req, res, next) => {
  //@todo: make sure the player can only load characters belonging to them

  const { id } = req.params;
  // const hasCharacter = await req.user.hasPlayerCharacter(id);
  let playerCharacter = [];
  // if (hasCharacter) {
  playerCharacter = (
    await req.user.getPlayerCharacters({
      // where: { id },
      attributes: ["id", "name", "health", "gold"],
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
          attributes: { exclude: ["createdAt", "updatedAt"] }
        }
      ]
    })
  )[0];
  // } else {
  //   res.sendStatus(404);
  // }
  const payload = {
    userId: req.user.id,
    characterId: playerCharacter.id,
    id: playerCharacter.id,
    name: playerCharacter.name,
    health: playerCharacter.health,
    templateName: playerCharacter.templateCharacter.name,
    spriteSheetImageUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    xPos: playerCharacter.location.xPos,
    yPos: playerCharacter.location.yPos,
    gold: playerCharacter.gold
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

  gameSync.emit("otherPlayerLoad", payload);
});

module.exports = router;
