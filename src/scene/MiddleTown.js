import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";
import { eventEmitter } from "../../src/event/EventEmitter";
import { Player } from "../entity/Player";
import { Monster } from "../entity/Monster";

export default class MiddleTown extends MMOScene {
  constructor() {
    super("MiddleTown");
  }

  preload() {
    super.preload();
  }

  create() {

    const map = this.make.tilemap({ key: "middle-town" });
    const townTiles = map.addTilesetImage("town", "town");

    this.groundLayer = map.createLayer("ground", townTiles, 0, 0);
    this.collisionLayer = map.createLayer("collisionLayer", townTiles, 0, 0);

    this.layers = [this.groundLayer, this.collisionLayer];

    // this.pathfinder = createPathFinder(map, this.layers);

    this.collisionLayer.setCollisionByProperty({ collides: true });

    this.transitionToForestPathFromMiddleTown = this.add.rectangle(810, 1600, 100, 100, 0xffffff, 0.5);
    this.physics.add.existing(this.transitionToForestPathFromMiddleTown);
    this.transitionToForestPathFromMiddleTown.body.enable = true;
    this.physics.world.add(this.transitionToForestPathFromMiddleTown.body);
    this.transitionZones.push({
      sceneName: "ForestPath",
      sceneId: 3,
      xPos: 425,
      yPos: 125,
      transitionPoint: this.transitionToForestPathFromMiddleTown
    });

    this.transitionToDungeonFromMiddleTown = this.add.rectangle(1000, 1000, 100, 100, 0xffffff, 0.5);
    this.physics.add.existing(this.transitionToDungeonFromMiddleTown);
    this.transitionToDungeonFromMiddleTown.body.enable = true;
    this.physics.world.add(this.transitionToDungeonFromMiddleTown.body);
    this.transitionZones.push({
      sceneName: "Dungeon",
      sceneId: 5,
      xPos: 425,
      yPos: 125,
      transitionPoint: this.transitionToDungeonFromMiddleTown
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
