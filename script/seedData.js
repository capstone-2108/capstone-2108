const userData = [
  {
    user: {
      email: "fox@mmo.com",
      password: "123",
      firstName: "fox",
      lastName: "cute",
      isAdmin: true,
      loggedIn: false
    },
    playerCharacter: {
      name: "fox_player",
      health: 100,
      totalHealth: 100,
      strength: 55,
      intelligence: 70,
      templateCharacterId: 1,
      active: false,
      gold: 15,
      experience: 70,
      level: 3
    },
    location: {
      xPos: 300,
      yPos: 500,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "fox"
  },
  {
    user: {
      email: "arcana@mmo.com",
      password: "123",
      firstName: "arcana",
      lastName: "",
      isAdmin: true,
      loggedIn: false
    },
    playerCharacter: {
      name: "Arcana",
      health: 100,
      totalHealth: 100,
      strength: 75,
      intelligence: 100,
      templateCharacterId: 2,
      active: false,
      gold: 30,
      experience: 50,
      level: 5
    },
    location: {
      xPos: 350,
      yPos: 500,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "sorcerer"
  }
];

const templateCharacterData = [
  {
    name: "fox",
    baseStrength: 55,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 70,
    portrait: "/assets/characters/character-protrait-emotes-2/Fox_frame.png",
    description: "Increased health and melee damage. No ranged attacks"
  },
  {
    name: "sorcerer",
    baseStrength: 75,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 100,
    portrait: "/assets/characters/character-protrait-emotes-2/Sorcerer_frame.png",
    description: "High damage, low health and movement speed"
  },
  {
    name: "beastmaster",
    baseStrength: 100,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 50,
    portrait: "/assets/characters/character-protrait-emotes-2/Beastmaster_frame.png",
    description: "High strength, but not the brightest"
  },
  {
    name: "swashbuckler",
    baseStrength: 80,
    isPlayable: true,
    baseHealth: 100,
    baseIntelligence: 70,
    portrait: "/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png",
    description: "Average strength and intelligence"
  },
  {
    name: "orc",
    baseStrength: 100,
    isPlayable: false,
    baseHealth: 500,
    baseIntelligence: 20,
    portrait: "/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png",
    description: "Strong, but slow and not adept at magic"
  }
];

const spriteSheetData = [
  {
    name: "fox",
    spriteSheet_image_url: "../spritesheets/heroes/fox/fox.png",
    spriteSheet_json_url: "../spritesheets/heroes/fox/fox.json"
  },
  {
    name: "sorcerer",
    spriteSheet_image_url: "../spritesheets/heroes/sorcerer/sorcerer.png",
    spriteSheet_json_url: "../spritesheets/heroes/sorcerer/sorcerer.json"
  },
  {
    name: "beastmaster",
    spriteSheet_image_url: "../spritesheets/heroes/beastmaster/beastmaster.png",
    spriteSheet_json_url: "../spritesheets/heroes/beastmaster/beastmaster.json"
  },
  {
    name: "swashbuckler",
    spriteSheet_image_url: "../spritesheets/heroes/swashbuckler/swashbuckler.png",
    spriteSheet_json_url: "../spritesheets/heroes/swashbuckler/swashbuckler.json"
  },
  {
    name: "orc",
    spriteSheet_image_url: "../spritesheets/monsters/orc/orc.png",
    spriteSheet_json_url: "../spritesheets/monsters/orc/orc.json"
  }
];

const sceneData = [
  {
    id: 1,
    name: "StarterTown",
    mapId: 1
  },
  {
    id: 2,
    name: "ForestScene",
    mapId: 1
  },
  {
    id: 3,
    name: "ForestPath",
    mapId: 1
  },
  {
    id: 4,
    name: "MiddleTown",
    mapId: 1
  },
  {
    id: 5,
    name: "Dungeon",
    mapId: 1
  }
];

const mapData = [
  {
    name: "firstMap"
  }
];

const npcData = [
  // remove this orc after development
  {
    npc: {
      name: "Orc",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 250,
      yPos: 400,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "orc"
  },
  // FIRST SCENE MONSTERS
  {
    npc: {
      name: "Orcie",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1716,
      yPos: 800,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcla",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 2900,
      yPos: 625,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "orc"
  },
  // START OF SECOND SCENE MONSTERS
  {
    npc: {
      name: "Orcta",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 810,
      yPos: 1000,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcme",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 625,
      yPos: 300,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcccc",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1200,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Ork",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 200,
      yPos: 1100,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orkbi",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1800,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orktri",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 2550,
      yPos: 1450,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orka",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1400,
      yPos: 700,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orkione",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1340,
      yPos: 200,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcione",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 2800,
      yPos: 500,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orciline",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 2300,
      yPos: 350,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  // START OF THIRD SCENE MONSTERS
  {
    npc: {
      name: "Orktastic",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 400,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orktada",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 375,
      yPos: 1000,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orkkabo",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 425,
      yPos: 700,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orkalalo",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 400,
      yPos: 400,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "orc"
  },
  // START OF FOURTH SCENE MONSTERS
  {
    npc: {
      name: "Orcaby",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 810,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orclom",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 400,
      yPos: 650,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcpi",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 810,
      yPos: 400,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcpi",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1000,
      yPos: 600,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "orc"
  },
  // START OF FIFTH SCENE MONSTERS
  {
    npc: {
      name: "Orcipipi",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 100,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orclona",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 900,
      yPos: 1000,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orctaco",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 950,
      yPos: 400,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcpizza",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1200,
      yPos: 1200,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcspaghetti",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1300,
      yPos: 400,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Orcramen",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 250,
      yPos: 200,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "orc"
  },
];

module.exports = {
  userData,
  templateCharacterData,
  spriteSheetData,
  sceneData,
  mapData,
  npcData
};
