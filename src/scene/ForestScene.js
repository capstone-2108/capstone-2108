import MMOScene from "./MMOScene";

export default class ForestScene extends MMOScene {
  constructor() {
    super("ForestScene");
    // this.playerData = {};
    // this.otherPlayers = {};
    // this.subscribes = [];
  }

  preload() {}

  create() {
    const map = this.make.tilemap({ key: "second-scene" });
    const grassTiles = map.addTilesetImage("grass", "grass");
    const plantTiles = map.addTilesetImage("plant", "plant");
    const propsTiles = map.addTilesetImage("props", "props");
    const stoneTiles = map.addTilesetImage("stone", "stone");
    const structureTiles = map.addTilesetImage("structure", "structure");
    const wallTiles = map.addTilesetImage("wall", "wall");

    this.groundLayer = map.createLayer("ground", grassTiles, 0, 0);
    this.treesLayer = map.createLayer("trees", [ grassTiles, propsTiles, wallTiles, plantTiles, stoneTiles ], 0, 0);
    this.trees2Layer = map.createLayer("trees2", [ grassTiles, plantTiles, propsTiles, structureTiles, wallTiles ], 0, 0);

    // collision
    // I DON"T THINK THIS IS CURRENTLY WORKING
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.treesLayer.setCollisionByProperty({ collides: true });
    this.trees2Layer.setCollisionByProperty({ collides: true });
  }
}
