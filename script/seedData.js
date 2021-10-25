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
      yPos: 700,
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
      health: 10000,
      totalHealth: 10000,
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
    baseStrength: 11,
    baseIntelligence: 8,
    constitution: 11,
    baseHealth: 70,
    isPlayable: true,
    portrait: "/assets/characters/character-protrait-emotes-2/Fox_frame.png",
    description: "Increased health and melee damage. No ranged attacks"
  },
  {
    name: "sorcerer",
    baseStrength: 5,
    baseIntelligence: 11,
    constitution: 4,
    baseHealth: 30,
    isPlayable: true,
    portrait: "/assets/characters/character-protrait-emotes-2/Sorcerer_frame.png",
    description: "High damage, low health and movement speed"
  },
  {
    name: "beastmaster",
    baseStrength: 9,
    baseIntelligence: 7,
    constitution: 9,
    baseHealth: 60,
    isPlayable: true,
    portrait: "/assets/characters/character-protrait-emotes-2/Beastmaster_frame.png",
    description: "High strength, but not the brightest"
  },
  {
    name: "swashbuckler",
    baseStrength: 10,
    baseIntelligence: 6,
    constitution: 9,
    baseHealth: 60,
    isPlayable: true,
    portrait: "/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png",
    description: "Average strength and intelligence"
  },
  {
    name: "orc",
    baseStrength: 12,
    baseIntelligence: 2,
    constitution: 10,
    baseHealth: 65,
    isPlayable: false,
    portrait: "/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png",
    description: "Strong, but slow and not adept at magic"
  },
  {
    name: "troll",
    baseStrength: 15,
    baseIntelligence: 3,
    constitution: 10,
    baseHealth: 75,
    isPlayable: false,
    portrait: "/assets/spritesheets/monsters/troll/portrait.png",
    description: "Strong, but slow and not adept at magic"
  },
  {
    name: "goblin",
    baseStrength: 15,
    baseIntelligence: 5,
    constitution: 10,
    baseHealth: 75,
    isPlayable: false,
    portrait: "/assets/spritesheets/monsters/goblin/portrait.png",
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
  },
  {
    name: "troll",
    spriteSheet_image_url: "../spritesheets/monsters/troll/troll.png",
    spriteSheet_json_url: "../spritesheets/monsters/troll/troll.json"
  },
  {
    name: "goblin",
    spriteSheet_image_url: "../spritesheets/monsters/goblin/goblin.png",
    spriteSheet_json_url: "../spritesheets/monsters/goblin/goblin.json"
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
      name: "Goblin",
      health: 100,
      totalHealth: 1000
    },
    location: {
      xPos: 250,
      yPos: 400,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "goblin"
  },
  // FIRST SCENE MONSTERS
  {
    npc: {
      name: "Orcie",
      health: 100,
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
      name: "Trollie",
      health: 150,
      totalHealth: 1000
    },
    location: {
      xPos: 2900,
      yPos: 625,
      facingDirection: "w",
      sceneId: 1
    },
    templateCharacter: "troll"
  },
  // START OF SECOND SCENE MONSTERS
  {
    npc: {
      name: "Orcta",
      health: 200,
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
      name: "Goblimie",
      health: 250,
      totalHealth: 1000
    },
    location: {
      xPos: 625,
      yPos: 300,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "goblin"
  },
  {
    npc: {
      name: "Trolllllll",
      health: 300,
      totalHealth: 1000
    },
    location: {
      xPos: 1200,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Ork",
      health: 350,
      totalHealth: 1000
    },
    location: {
      xPos: 350,
      yPos: 1100,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "orc"
  },
  {
    npc: {
      name: "Trollbi",
      health: 400,
      totalHealth: 1000
    },
    location: {
      xPos: 1800,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Goblintri",
      health: 450,
      totalHealth: 1000
    },
    location: {
      xPos: 2550,
      yPos: 1450,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "goblin"
  },
  {
    npc: {
      name: "Orka",
      health: 500,
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
      name: "Trollione",
      health: 550,
      totalHealth: 1000
    },
    location: {
      xPos: 1340,
      yPos: 200,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Goblinon",
      health: 600,
      totalHealth: 1000
    },
    location: {
      xPos: 2800,
      yPos: 500,
      facingDirection: "w",
      sceneId: 2
    },
    templateCharacter: "goblin"
  },
  {
    npc: {
      name: "Orciline",
      health: 650,
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
      name: "Trolltastic",
      health: 700,
      totalHealth: 1000
    },
    location: {
      xPos: 400,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Goblintada",
      health: 750,
      totalHealth: 1000
    },
    location: {
      xPos: 375,
      yPos: 1000,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "goblin"
  },
  {
    npc: {
      name: "Orkkabo",
      health: 800,
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
      name: "Trollalalo",
      health: 750,
      totalHealth: 1000
    },
    location: {
      xPos: 400,
      yPos: 400,
      facingDirection: "w",
      sceneId: 3
    },
    templateCharacter: "troll"
  },
  // START OF FOURTH SCENE MONSTERS
  {
    npc: {
      name: "Goblinbaby",
      health: 800,
      totalHealth: 1000
    },
    location: {
      xPos: 810,
      yPos: 1300,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "goblin"
  },
  {
    npc: {
      name: "Orclom",
      health: 850,
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
      name: "Trollpi",
      health: 850,
      totalHealth: 1000
    },
    location: {
      xPos: 810,
      yPos: 400,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Goblinpie",
      health: 900,
      totalHealth: 1000
    },
    location: {
      xPos: 1000,
      yPos: 600,
      facingDirection: "w",
      sceneId: 4
    },
    templateCharacter: "goblin"
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
      name: "Trollona",
      health: 920,
      totalHealth: 1000
    },
    location: {
      xPos: 900,
      yPos: 1000,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Goblintaco",
      health: 940,
      totalHealth: 1000
    },
    location: {
      xPos: 950,
      yPos: 400,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "goblin"
  },
  {
    npc: {
      name: "Orcpizza",
      health: 960,
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
      name: "Trollspaghetti",
      health: 980,
      totalHealth: 1000
    },
    location: {
      xPos: 1300,
      yPos: 400,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "troll"
  },
  {
    npc: {
      name: "Goblinramen",
      health: 1000,
      totalHealth: 1000
    },
    location: {
      xPos: 250,
      yPos: 200,
      facingDirection: "w",
      sceneId: 5
    },
    templateCharacter: "goblin"
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
