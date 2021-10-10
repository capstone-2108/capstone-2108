"use strict";

const {
  db,
  Map,
  Location,
  Npc,
  PlayerCharacter,
  Scene,
  SpriteSheet,
  TemplateCharacter,
  User
} = require("../server/db");

const {
  userData,
  templateCharacterData,
  spriteSheetData,
  playerCharacterData,
  sceneData,
  locationData,
  mapData,
  npcData
} = require("./seedData");

async function seed() {
  await db.sync({ force: true }); // clears db and matches models to tables
  console.log("db synced!");

  const userArray = await Promise.all(
    userData.map((user) => {
      return User.create(user);
    })
  );

  const templateCharacterArray = await Promise.all(
    templateCharacterData.map((templateCharacter) => {
      return TemplateCharacter.create(templateCharacter);
    })
  );

  const spriteSheetArray = await Promise.all(
    spriteSheetData.map((spriteSheet) => {
      return SpriteSheet.create(spriteSheet);
    })
  );
  const mapArray = await Promise.all(
    mapData.map((map) => {
      return Map.create(map);
    })
  );

  const sceneArray = await Promise.all(
    sceneData.map((scene) => {
      return Scene.create(scene);
    })
  );

  const locationArray = await Promise.all(
    locationData.map((location) => {
      return Location.create(location);
    })
  );

  const playerCharacterArray = await Promise.all(
    playerCharacterData.map((playerCharacter) => {
      return PlayerCharacter.create(playerCharacter);
    })
  );

  const npcArray = await Promise.all(
    npcData.map((npc) => {
      return Npc.create(npc);
    })
  );
}

async function runSeed() {
  console.log("seeding...");
  try {
    await seed();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    console.log("closing db connection");
    await db.close();
    console.log("db connection closed");
  }
}

if (module === require.main) {
  runSeed();
}

module.exports = seed;
