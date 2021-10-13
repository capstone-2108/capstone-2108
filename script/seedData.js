const userData = [
  {
    id: 1,
    email: "fox@mmo.com",
    password: "123",
    firstName: "fox",
    lastName: "cute",
    isAdmin: true
  },
  {
    id: 2,
    email: "arcana@mmo.com",
    password: "123",
    firstName: "Amaya",
    lastName: "Agha",
    isAdmin: true
  }
];

const templateCharacterData = [
  {
    id:1,
    name: "Fox",
    baseStrength: 55,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 70,
    portrait: "/assets/characters/character-protrait-emotes-2/Fox_frame.png",
    description: "Increased healthspan, but less damage"
  },
  {
    id:2,
    name: "Sorcerer",
    baseStrength: 75,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 100,
    portrait: "/assets/characters/character-protrait-emotes-2/Sorcerer_frame.png",
    description: "High intelligence, but dies faster"
  },
  {
  id: 3,
  name: "Beastmaster",
  baseStrength: 100,
  isPlayable: true,
  baseHealth: 100,
  baseIntelligence: 50,
  portrait: "/assets/characters/character-protrait-emotes-2/Beastmaster_frame.png",
  description: "High strength, but not the brightest"
  },
  {
    id: 4,
    name: "Swashbuckler",
    baseStrength: 80,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 70,
    portrait: "/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png",
    description: "Average strength and intelligence"
    },
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
    strength: 55,
    intelligence: 70,
    userId: 1,
    templateCharacterId: 1,
    locationId: 1,
    gold: 15
  },
  {
    name: "Arcana",
    health: 100,
    strength: 75,
    intelligence: 100,
    userId: 2,
    templateCharacterId: 2,
    locationId: 2,
    gold: 30
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
