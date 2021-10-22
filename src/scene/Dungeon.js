import MMOScene from "./MMOScene";

export default class Dungeon extends MMOScene {
  constructor() {
    super("Dungeon");
  }

  preload() {
    super.preload();
  }

  create() {

    const map = this.make.tilemap({ key: "dungeon" });
    const dungeonTiles = map.addTilesetImage("dungeon", "dungeon");

    this.groundLayer = map.createLayer("ground", dungeonTiles, 0, 0);
    this.collisionLayer = map.createLayer("collisionLayer", dungeonTiles, 0, 0);
    this.propsLayer = map.createLayer("props", dungeonTiles, 0, 0);

    this.layers = [this.groundLayer, this.collisionLayer, this.propsLayer];

    // this.pathfinder = createPathFinder(map, this.layers);

    this.collisionLayer.setCollisionByProperty({ collides: true });

    this.transitionToMiddleTownFromDungeon = this.add.rectangle(810, 1600, 100, 100, 0xffffff, 0.5);
    this.physics.add.existing(this.transitionToMiddleTownFromDungeon);
    this.transitionToMiddleTownFromDungeon.body.enable = true;
    this.physics.world.add(this.transitionToMiddleTownFromDungeon.body);
    this.transitionZones.push({
      sceneName: "MiddleTown",
      sceneId: 4,
      xPos: 425,
      yPos: 125,
      transitionPoint: this.transitionToMiddleTownFromDungeon
    });

    super.create();
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
