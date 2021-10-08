//this is the access point for all things database related!
const { db } = require("./db");
const { User } = require("./models/User");
const { TemplateCharacter } = require("./models/TemplateCharacter");
const { SpriteSheet } = require("./models/SpriteSheet");
const { User_character_join } = require("./models/User_character_join");
const { Location } = require("./models/Location");
const { Npc } = require("./models/Npc");
const { Scene } = require("./models/Scene");
const { Map } = require("./models/map");
//associations could go here!

User.belongsToMany(TemplateCharacter, { through: User_character_join });
TemplateCharacter.belongsToMany(User, { through: User_character_join });

User_character_join.belongsTo(Location);
Location.hasMany(User_character_join);

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
  User_character_join,
  Location,
  Npc,
  Scene,
  Map
};
