const userData = [
  {
    id: 1,
    email: "fox@mmo.com",
    password: "123",
    firstName: "fox",
    lastName: "cute",
    isAdmin: true,
    loggedIn: false
  },
  {
    id: 2,
    email: "arcana@mmo.com",
    password: "123",
    firstName: "Amaya",
    lastName: "Agha",
    isAdmin: true,
    loggedIn: false
  }
];

const templateCharacterData = [
  {
    id:1,
    name: "fox",
    baseStrength: 100,
    isPlayable: true,
    baseHealth: 100
  },
  {
    id:2,
    name: "sorcerer",
    baseStrength: 100,
    isPlayable: false,
    baseHealth: 100
  }
];

const spriteSheetData = [
  {
    name: "fox",
    spriteSheet_image_url: "../spritesheets/heroes/fox/fox.png",
    spriteSheet_json_url: "../spritesheets/heroes/fox/fox.json",
    templateCharacterId: 1
  },
  {
    name: "sorcerer",
    spriteSheet_image_url: "../spritesheets/heroes/sorcerer/sorcerer.png",
    spriteSheet_json_url: "../spritesheets/heroes/sorcerer/sorcerer.json",
    templateCharacterId: 2
  },
];

const sceneData = [
  {
    name: "village",
    mapId: 1
  }
];

const playerCharacterData = [
  {
    name: "fox_player",
    health: 100,
    userId: 1,
    templateCharacterId: 1,
    locationId: 1,
    active: false
  },
  {
    name: "Arcana",
    health: 100,
    userId: 2,
    templateCharacterId: 2,
    locationId: 2,
    active: false,
  }
];

const locationData = [
  {
    xPos: 300,
    yPos: 500,
    facingDirection: "left",
    sceneId: 1
  },
  {
    xPos: 350,
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
    name: "Frodo Baggins",
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
