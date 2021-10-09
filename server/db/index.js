//this is the access point for all things database related!
const { db } = require("./db");
const { User } = require("./models/User");
const { TemplateCharacter } = require("./models/TemplateCharacter");
const { SpriteSheet } = require("./models/SpriteSheet");
const { PlayerCharacter } = require("./models/PlayerCharacter");
const { Location } = require("./models/Location");
const { Npc } = require("./models/Npc");
const { Scene } = require("./models/Scene");
const { Map } = require("./models/map");
//associations could go here!

// User.belongsToMany(TemplateCharacter, { through: PlayerCharacter });
// TemplateCharacter.belongsToMany(User, { through: PlayerCharacter });

User.hasMany(PlayerCharacter);
PlayerCharacter.belongsTo(User);

PlayerCharacter.belongsTo(TemplateCharacter);
TemplateCharacter.hasMany(PlayerCharacter);

PlayerCharacter.belongsTo(Location);
Location.hasMany(PlayerCharacter);

Npc.belongsTo(Location);
Location.hasMany(Npc);

Location.belongsTo(Scene);
Scene.hasMany(Location);

Npc.belongsTo(TemplateCharacter);
TemplateCharacter.hasMany(Npc);

TemplateCharacter.hasMany(SpriteSheet);
SpriteSheet.belongsTo(TemplateCharacter);

Scene.belongsTo(Map);
Map.hasMany(Scene);

module.exports = {
  db,
  User,
  TemplateCharacter,
  SpriteSheet,
  PlayerCharacter,
  Location,
  Npc,
  Scene,
  Map
};
