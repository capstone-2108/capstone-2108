import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";

export default class ForestScene extends MMOScene {
  constructor() {
    super("ForestScene");
  }

  preload() {
    super.preload();
  }

  create() {
    this.music = this.sound.add("scene2Audio");
    this.music.loop = true;
    this.music.play();

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

    this.tileSize = 32;

    this.pathfinder = createPathFinder(map, this.layers);

    this.treesLayer.setCollisionByProperty({ collides: true });
    this.trees2Layer.setCollisionByProperty({ collides: true });

    this.transitionToStarterTownFromForestScene = this.add.rectangle(0, 650, 100, 100, 0xffffff, 0);
    this.physics.add.existing(this.transitionToStarterTownFromForestScene);
    this.transitionToStarterTownFromForestScene.body.enable = true;
    this.physics.world.add(this.transitionToStarterTownFromForestScene.body);
    this.transitionZones.push({
      sceneName: 'StarterTown',
      sceneId: 1,
      xPos: 3100,
      yPos: 655,
      transitionPoint: this.transitionToStarterTownFromForestScene
    });

    this.transitionToForestPathFromForestScene = this.add.rectangle(1340, 0, 100, 100, 0xffffff, 0);
    this.physics.add.existing(this.transitionToForestPathFromForestScene);
    this.transitionToForestPathFromForestScene.body.enable = true;
    this.physics.world.add(this.transitionToForestPathFromForestScene.body);
    this.transitionZones.push({
      sceneName: 'ForestPath',
      sceneId: 3,
      xPos: 425,
      yPos: 1500,
      transitionPoint: this.transitionToForestPathFromForestScene
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
