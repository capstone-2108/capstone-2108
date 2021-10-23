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

    this.layers = [this.groundLayer, this.worldLayer, this.belowCharLayer];

    // collision
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.worldLayer.setCollisionByProperty({ collides: true });
    this.belowCharLayer.setCollisionByProperty({ collides: true });

    this.pathfinder = createPathFinder(this.map, this.layers);

    this.transitionToForestSceneFromStarterTown = this.add.rectangle(3200, 625, 100, 100, 0xffffff, 0);
    // this.transitionToForestSceneFromStarterTown = this.add.rectangle(500, 500, 100, 100, 0xffffff, 0.5).setDepth(1);
    this.physics.add.existing(this.transitionToForestSceneFromStarterTown);
    this.transitionToForestSceneFromStarterTown.body.enable = true;
    this.physics.world.add(this.transitionToForestSceneFromStarterTown.body);
    this.transitionZones.push({
      sceneName: 'ForestScene',
      sceneId: 2,
      xPos: 140,
      yPos: 675,
      transitionPoint: this.transitionToForestSceneFromStarterTown
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
