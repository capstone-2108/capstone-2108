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

    this.map = this.make.tilemap({ key: "second-scene" });
    const grassTiles = this.map.addTilesetImage("grass", "grass");
    const plantTiles = this.map.addTilesetImage("plant", "plant");
    const propsTiles = this.map.addTilesetImage("props", "props");
    const stoneTiles = this.map.addTilesetImage("stone", "stone");
    const structureTiles = this.map.addTilesetImage("structure", "structure");
    const wallTiles = this.map.addTilesetImage("wall", "wall");

    this.groundLayer = this.map.createLayer("ground", grassTiles, 0, 0);
    this.treesLayer = this.map.createLayer(
      "trees",
      [grassTiles, propsTiles, wallTiles, plantTiles, stoneTiles],
      0,
      0
    );
    this.trees2Layer = this.map.createLayer(
      "trees2",
      [grassTiles, plantTiles, propsTiles, structureTiles, wallTiles],
      0,
      0
    );

    this.layers = [this.groundLayer, this.treesLayer, this.trees2Layer];

    this.tileSize = 32;

    this.pathfinder = createPathFinder(this.map, this.layers);

    this.treesLayer.setCollisionByProperty({ collides: true });
    this.trees2Layer.setCollisionByProperty({ collides: true });

    this.transitionToStarterTownFromForestScene = this.add.rectangle(0, 650, 100, 100, 0xffffff, 0);
    this.physics.add.existing(this.transitionToStarterTownFromForestScene);
    this.transitionToStarterTownFromForestScene.body.enable = true;
    this.physics.world.add(this.transitionToStarterTownFromForestScene.body);
    this.transitionZones.push({
      sceneName: "StarterTown",
      sceneDisplayName: "Noldo Village",
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
      sceneName: "ForestPath",
      sceneDisplayName: "Road Less Traveled",
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
