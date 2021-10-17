import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";

export default class StarterTown extends MMOScene {
  constructor() {
    super("StarterTown");
  }
  preload() {
    super.preload();
  }

  create() {
    this.map = this.make.tilemap({ key: "start-scene" }); //the key: should match what you specified in this.load.tilemapTiledJSON

    //tileSetName has to match the name of the tileset in Tiled, and the key is the image key we used for this tile set
    const town = this.map.addTilesetImage("town", "town"); //loads the tileset used to make up this map

    this.groundLayer = this.map.createLayer("ground", town, 0, 0);
    this.worldLayer = this.map.createLayer("world", town, 0, 0);
    this.belowCharLayer = this.map.createLayer("belowChar", town, 0, 0);

    // collision
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.worldLayer.setCollisionByProperty({ collides: true });
    this.belowCharLayer.setCollisionByProperty({ collides: true });

    this.pathfinder = createPathFinder(this.map, [
      this.groundLayer,
      this.worldLayer,
      this.belowCharLayer
    ]);

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
