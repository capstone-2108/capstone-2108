import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";

export default class ForestPath extends MMOScene {
  constructor() {
    super("ForestPath");
  }

  preload() {
    super.preload();
  }

  create() {
    // this.music = this.sound.add("scene3Audio");
    // this.music.loop = true;
    // this.music.play();

    const map = this.make.tilemap({ key: "forest-path" });
    const grassTiles = map.addTilesetImage("grass", "grass");
    const plantTiles = map.addTilesetImage("plant", "plant");

    this.groundLayer = map.createLayer("ground", grassTiles, 0, 0);
    this.collisionLayer = map.createLayer("collisionLayer", plantTiles, 0, 0);

    this.layers = [this.groundLayer, this.collisionLayer];

    this.tileSize = 32;

    this.pathfinder = createPathFinder(map, this.layers);

    this.collisionLayer.setCollisionByProperty({ collides: true });

    this.transitionToForestSceneFromForestPath = this.add.rectangle(400, 1600, 100, 100, 0xffffff, 0);
    this.physics.add.existing(this.transitionToForestSceneFromForestPath);
    this.transitionToForestSceneFromForestPath.body.enable = true;
    this.physics.world.add(this.transitionToForestSceneFromForestPath.body);
    this.transitionZones.push({
      sceneName: "Darkwood",
      sceneId: 2,
      xPos: 1375,
      yPos: 150,
      transitionPoint: this.transitionToForestSceneFromForestPath
    });

    this.transitionToMiddleTownFromForestPath = this.add.rectangle(400, 0, 100, 100, 0xffffff, 0);
    this.physics.add.existing(this.transitionToMiddleTownFromForestPath);
    this.transitionToMiddleTownFromForestPath.body.enable = true;
    this.physics.world.add(this.transitionToMiddleTownFromForestPath.body);
    this.transitionZones.push({
      sceneName: "Almaren Village",
      sceneId: 4,
      xPos: 800,
      yPos: 1400,
      transitionPoint: this.transitionToMiddleTownFromForestPath
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
