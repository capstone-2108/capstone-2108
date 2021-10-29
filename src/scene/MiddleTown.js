import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";

export default class MiddleTown extends MMOScene {
  constructor() {
    super("MiddleTown");
  }

  preload() {
    super.preload();
  }

  create() {
    this.music = this.sound.add("scene4Audio");
    this.music.loop = true;
    this.music.play();

    this.map = this.make.tilemap({ key: "middle-town" });
    const townTiles = this.map.addTilesetImage("town", "town", 16, 16, 1, 2);

    this.groundLayer = this.map.createLayer("ground", townTiles, 0, 0);
    this.collisionLayer = this.map.createLayer("collisionLayer", townTiles, 0, 0);
    this.openDoor = this.map.createLayer("openDoor", townTiles, 0, 0);

    this.layers = [this.groundLayer, this.collisionLayer, this.openDoor];

    this.tileSize = 16;

    this.collisionLayer.setCollisionByProperty({ collides: true });

    this.pathfinder = createPathFinder(this.map, this.layers);

    this.transitionToForestPathFromMiddleTown = this.add.rectangle(810, 1600, 100, 100, 0xffffff, 0);
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

    this.transitionToDungeonFromMiddleTown = this.add.rectangle(1025, 550, 50, 50, 0xffffff, 0);
    this.physics.add.existing(this.transitionToDungeonFromMiddleTown);
    this.transitionToDungeonFromMiddleTown.body.enable = true;
    this.physics.world.add(this.transitionToDungeonFromMiddleTown.body);
    this.transitionZones.push({
      sceneName: "Dungeon",
      sceneId: 5,
      xPos: 250,
      yPos: 1020,
      transitionPoint: this.transitionToDungeonFromMiddleTown
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
