import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";
import { eventEmitter } from "../../src/event/EventEmitter";
import { Player } from "../entity/Player";
import { Monster } from "../entity/Monster";

export default class ForestScene extends MMOScene {
  constructor() {
    super("ForestScene");
  }

  preload() {
    super.preload();
  }

  create() {
    this.monster = new Monster(this, 200, 400, "orc", "orc", 1);
    this.monsterGroup = this.physics.add.group();
    this.monsterGroup.add(this.monster);

    const map = this.make.tilemap({ key: "second-scene" });
    const grassTiles = map.addTilesetImage("grass", "grass");
    const plantTiles = map.addTilesetImage("plant", "plant");
    const propsTiles = map.addTilesetImage("props", "props");
    const stoneTiles = map.addTilesetImage("stone", "stone");
    const structureTiles = map.addTilesetImage("structure", "structure");
    const wallTiles = map.addTilesetImage("wall", "wall");

    this.groundLayer = map.createLayer("ground", grassTiles, 0, 0);
    this.treesLayer = map.createLayer(
      "trees",
      [grassTiles, propsTiles, wallTiles, plantTiles, stoneTiles],
      0,
      0
    );
    this.trees2Layer = map.createLayer(
      "trees2",
      [grassTiles, plantTiles, propsTiles, structureTiles, wallTiles],
      0,
      0
    );

    this.layers = [this.groundLayer, this.treesLayer, this.trees2Layer];

    // this.pathfinder = createPathFinder(map, this.layers);

    // collision
    // I DON"T THINK THIS IS CURRENTLY WORKING
    // this.groundLayer.setCollisionByProperty({ collides: true });
    // this.treesLayer.setCollisionByProperty({ collides: true });
    // this.trees2Layer.setCollisionByProperty({ collides: true });
    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
