import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";
import { eventEmitter } from "../../src/event/EventEmitter";
import { Player } from "../entity/Player";
import { Monster } from "../entity/Monster";

export default class ForestPath extends MMOScene {
  constructor() {
    super("ForestPath");
  }

  preload() {
    super.preload();
  }

  create() {
    this.monster = new Monster(this, 200, 400, "orc", "orc", 1);
    this.monsterGroup = this.physics.add.group();
    this.monsterGroup.add(this.monster);

    const map = this.make.tilemap({ key: "forest-path" });
    const grassTiles = map.addTilesetImage("grass", "grass");
    const plantTiles = map.addTilesetImage("plant", "plant");

    this.groundLayer = map.createLayer("ground", grassTiles, 0, 0);
    this.collisionLayer = map.createLayer("collisionLayer", plantTiles, 0, 0);

    this.layers = [this.groundLayer, this.collisionLayer];

    // this.pathfinder = createPathFinder(map, this.layers);

    this.collisionLayer.setCollisionByProperty({ collides: true });

    this.transitionToForestSceneFromForestPath = this.add.rectangle(400, 1600, 100, 100, 0xffffff, 0.5);
    this.physics.add.existing(this.transitionToForestSceneFromForestPath);
    this.transitionToForestSceneFromForestPath.body.enable = true;
    this.physics.world.add(this.transitionToForestSceneFromForestPath.body);
    this.transitionZones.push({
      sceneName: "ForestScene",
      sceneId: 2,
      transitionPoint: this.transitionToForestSceneFromForestPath
    });

    this.transitionToMiddleTownFromForestPath = this.add.rectangle(400, 0, 100, 100, 0xffffff, 0.5);
    this.physics.add.existing(this.transitionToMiddleTownFromForestPath);
    this.transitionToMiddleTownFromForestPath.body.enable = true;
    this.physics.world.add(this.transitionToMiddleTownFromForestPath.body);
    this.transitionZones.push({
      sceneName: "MiddleTown",
      sceneId: 4,
      transitionPoint: this.transitionToMiddleTownFromForestPath
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
