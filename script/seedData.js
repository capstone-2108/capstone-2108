const userData = [
  {
    email: "ava@email.com",
    password: "aaaa",
    firstName: "ava",
    lastName: "choi",
    isAdmin: true
  }
];

const templateCharacterData = [
  {
    baseStrength: 100,
    isPlayable: true,
    baseHealth: 100
  },
  {
    baseStrength: 100,
    isPlayable: false,
    baseHealth: 100
  }
];
const spriteSheetData = [
  {
    name: "Fox_die",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_die.png",
    templateCharacterId: 1
  },
  {
    name: "Fox_hit",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_hit.png",
    templateCharacterId: 1
  },
  {
    name: "Fox_idle",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_idle.png",
    templateCharacterId: 1
  },
  {
    name: "Fox_melee_hitbox",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_melee_hitbox.png",
    templateCharacterId: 1
  },
  {
    name: "Fox_melee",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_melee.png",
    templateCharacterId: 1
  },
  {
    name: "Fox_run",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_run.png",
    templateCharacterId: 1
  },
  {
    name: "Fox_walk",
    spriteSheet_url: "../public/assets/characters/character-sprites/Fox_walk.png",
    templateCharacterId: 1
  }
];

const sceneData = [
  {
    name: "village",
    mapId: 1
  }
];

const playerCharacterData = [
  {
    name: "fox",
    health: 100,
    userId: 1,
    templateCharacterId: 1,
    locationId: 1
  }
];

const locationData = [
  {
    xPos: 300,
    yPos: 500,
    facingDirection: "left",
    sceneId: 1
  }
];

const mapData = [
  {
    name: "firstMap"
  }
];

const npcData = [
  {
    health: 100,
    locationId: 1,
    templateCharacterId: 2
  }
];

module.exports = {
  userData,
  templateCharacterData,
  spriteSheetData,
  playerCharacterData,
  sceneData,
  locationData,
  mapData,
  npcData
};
