const { requireTokenMiddleware } = require("../auth-middleware");
const router = require("express").Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser(process.env.cookieSecret));
const { worldChat, gameSync} = require("../socket");
const { TemplateCharacter, SpriteSheet,  } = require("../db");
const {PlayerCharacter} = require("../db/models/PlayerCharacter");
const {Location} = require("../db/models/Location");


//This fetches all template characters
router.get("/character", async (req, res, next) => {
  try {
    const result = await TemplateCharacter.findAll()
    res.json(result)
  } catch {
    next(err)
  }
});

router.post("/character", requireTokenMiddleware, async (req, res, next) => {
  console.log('in character backend route')
  try {
    const location = await Location.create({
      xPos: 300,
      yPos: 500,
      facingDirection: "e",
      sceneId: 1
    })
    //create newplayer in PlayerCharacter instance
    const newPlayer = await PlayerCharacter.create({
      name: req.body.name,
      health: req.body.character.baseHealth,
      strength: req.body.character.baseStrength,
      intelligence: req.body.character.baseIntelligence,
      locationId: location.id
    })
    await newPlayer.setUser(req.user)
    await newPlayer.setTemplateCharacter(req.body.character.id)
    // convert to payload constant (below)
    // newplayer get spritesheet
    console.log(newPlayer)
    res.json(newPlayer)
    // res.json(newPlayer.id)
  } catch (err) {
    next(err)
  }
})

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
            attributes: { exclude: ["createdAt", "updatedAt"] }
          }
        ]
      })
    )[0];
  // } else {
  //   res.sendStatus(404);
  // }
  const payload = {
    id:playerCharacter.id,
    name: playerCharacter.name,
    health: playerCharacter.health,
    templateName: playerCharacter.templateCharacter.name,
    spriteSheetImageUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    spriteSheetJsonUrl: playerCharacter.templateCharacter.spriteSheets[0].spriteSheet_image_url,
    xPos: playerCharacter.location.xPos,
    yPos: playerCharacter.location.yPos,
    facingDirection: playerCharacter.location.facingDirection
  }

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
