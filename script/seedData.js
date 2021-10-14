const userData = [
  {
    // id: 1,
    email: "fox@mmo.com",
    password: "123",
    firstName: "fox",
    lastName: "cute",
    isAdmin: true,
    loggedIn: false
  },
  {
    // id: 2,
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
    id: 1,
    name: "fox",
    baseStrength: 55,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 70,
    portrait: "/assets/characters/character-protrait-emotes-2/Fox_frame.png",
    description: "Increased healthspan, but less damage"
  },
  {
    id: 2,
    name: "sorcerer",
    baseStrength: 75,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 100,
    portrait: "/assets/characters/character-protrait-emotes-2/Sorcerer_frame.png",
    description: "High intelligence, but dies faster"
  },
  {
    id: 3,
    name: "beastmaster",
    baseStrength: 100,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 50,
    portrait: "/assets/characters/character-protrait-emotes-2/Beastmaster_frame.png",
    description: "High strength, but not the brightest"
  },
  {
    id: 4,
    name: "swashbuckler",
    baseStrength: 80,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 70,
    portrait: "/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png",
    description: "Average strength and intelligence"
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
  {
    name: "beastmaster",
    spriteSheet_image_url: "../spritesheets/heroes/beastmaster/beastmaster.png",
    spriteSheet_json_url: "../spritesheets/heroes/beastmaster/beastmaster.json",
    templateCharacterId: 3
  },
  {
    name: "swashbuckler",
    spriteSheet_image_url: "../spritesheets/heroes/swashbuckler/swashbuckler.png",
    spriteSheet_json_url: "../spritesheets/heroes/swashbuckler/swashbuckler.json",
    templateCharacterId: 3
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
    name: "fox_player",
    health: 100,
    totalHealth: 100,
    strength: 55,
    intelligence: 70,
    userId: 1,
    templateCharacterId: 1,
    locationId: 1,
    active: false,
    gold: 15,
    experience: 70,
    level: 3
  },
  {
    name: "Arcana",
    health: 100,
    totalHealth: 100,
    strength: 75,
    intelligence: 100,
    userId: 2,
    templateCharacterId: 2,
    locationId: 2,
    active: false,
    gold: 30,
    experience: 50,
    level: 5
  }
];

const locationData = [
  {
    xPos: 300,
    yPos: 500,
    facingDirection: "w",
    sceneId: 1
  },
  {
    xPos: 350,
    yPos: 500,
    facingDirection: "w",
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
