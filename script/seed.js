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
  mapData,
  npcData
} = require("./seedData");

function getObjectIndexedBy(dataRows, indexField) {
  const indexedObj = {}
  dataRows.forEach(templateCharacter => {
    indexedObj[templateCharacter[indexField]] = templateCharacter;
  });
  return indexedObj;
}

async function seed() {
  await db.sync({ force: true }); // clears db and matches models to tables
  console.log("db synced!");

  const templateCharactersArr = await Promise.all(
    templateCharacterData.map((templateCharacter) => {
      return TemplateCharacter.create(templateCharacter);
    })
  );
  let templateCharacterObj = getObjectIndexedBy(templateCharactersArr, "name");

  const spriteSheetArray = await Promise.all(
    spriteSheetData.map((spriteSheet) => {
      spriteSheet.templateCharacterId = templateCharacterObj[spriteSheet.name].id;
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

  for(let i = 0; i < userData.length; i++) {
    const userObj = userData[i];
    const user = await User.create(userObj.user);
    const location = await Location.create(userObj.location);
    userObj.playerCharacter.userId = user.id;
    userObj.playerCharacter.locationId = location.id;
    userObj.playerCharacter.templateCharacterId = templateCharacterObj[userObj.templateCharacter].id
    await PlayerCharacter.create(userObj.playerCharacter);
  }

  let npcObj = {};
  for(let i = 0; i < npcData.length; i++) {
    let npcArr = npcData[i].npc;
    let locationArr = npcData[i].location;
    let templateCharacterName = npcData[i].templateCharacter;
    const location = await Location.create(locationArr);
    npcArr.locationId = location.id;
    npcArr.templateCharacterId = templateCharacterObj[templateCharacterName].id
    npcObj[npcArr.name] = await Npc.create(npcArr);
  }
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
