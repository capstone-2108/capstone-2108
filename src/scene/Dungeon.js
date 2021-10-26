import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";

export default class Dungeon extends MMOScene {
  constructor() {
    super("Dungeon");
  }

  preload() {
    super.preload();
  }

  create() {
    // this.music = this.sound.add("scene5Audio");
    // this.music.loop = true;
    // this.music.play();

    const map = this.make.tilemap({ key: "dungeon" });
    const dungeonTiles = map.addTilesetImage("Dungeon", "dungeon");

    this.groundLayer = map.createLayer("ground", dungeonTiles, 0, 0);
    this.collisionLayer = map.createLayer("collisionLayer", dungeonTiles, 0, 0);
    this.propsLayer = map.createLayer("props", dungeonTiles, 0, 0);

    this.layers = [this.groundLayer, this.collisionLayer, this.propsLayer];

    this.tileSize = 16;

    this.pathfinder = createPathFinder(map, this.layers);

    this.collisionLayer.setCollisionByProperty({ collides: true });

    this.transitionToMiddleTownFromDungeon = this.add.rectangle(615, 170, 25, 25, 0xffffff, 0);
    this.physics.add.existing(this.transitionToMiddleTownFromDungeon);
    this.transitionToMiddleTownFromDungeon.body.enable = true;
    this.physics.world.add(this.transitionToMiddleTownFromDungeon.body);
    this.transitionZones.push({
      sceneName: "MiddleTown",
      sceneId: 4,
      xPos: 1025,
      yPos: 650,
      transitionPoint: this.transitionToMiddleTownFromDungeon
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
