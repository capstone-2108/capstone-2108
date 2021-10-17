import MMOScene from "./MMOScene";
import { createPathFinder } from "../pathfinding/pathfinding";
import { eventEmitter } from "../../src/event/EventEmitter";
import { Player } from "../entity/Player";
import { Monster } from "../entity/Monster";

export default class ForestScene extends MMOScene {
  constructor() {
    super("ForestScene");
    // this.playerData = {};
    // this.otherPlayers = {};
    // this.subscribes = [];
  }

  preload() {
    super.preload();
  }

  create() {
    this.monster = new Monster(this, 200, 400, "orc", "orc", 1);
    this.monsterGroup = this.physics.add.group();
    this.monsterGroup.add(this.monster);

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

    // collision
    // I DON"T THINK THIS IS CURRENTLY WORKING
    // this.groundLayer.setCollisionByProperty({ collides: true });
    // this.treesLayer.setCollisionByProperty({ collides: true });
    // this.trees2Layer.setCollisionByProperty({ collides: true });

  //   const scenePlayerLoad = (data) => {
  //     this.playerData = data;
  //     this.player = new Player(
  //       this,
  //       data.xPos,
  //       data.yPos,
  //       "player",
  //       data.templateName,
  //       true,
  //       data.characterId
  //     );

  //     console.log('PLAYER', this.player)

  //     this.physics.add.overlap(this.transitionRectangle, this.player, () => {
  //       scenePlayerLoadUnsubscribe();
  //       nearbyPlayerLoadUnsubscribe();
  //       otherPlayerPositionChangedUnsubscribe();
  //       otherPlayerLoadUnsubscribe();
  //       this.scene.start("ForestScene");
  //     });

  //     this.cameras.main.startFollow(this.player);
  //     this.minimap = this.cameras
  //       .add(795, 0, 230, 230)
  //       .setZoom(0.15)
  //       .setName("mini")
  //       .startFollow(this.player);
  //     this.minimap.setBackgroundColor(0x002244);

  //     this.minimap.centerOn(0, 0);
  //     const minimapCircle = new Phaser.GameObjects.Graphics(this);
  //     minimapCircle.fillCircle(910, 115, 110);
  //     minimapCircle.fillCircle(910, 115, 110, "mini");

  //     const circle = new Phaser.Display.Masks.GeometryMask(this, minimapCircle);
  //     this.minimap.setMask(circle, true);
  //     // this.layers.forEach((layer) => {
  //     //   this.physics.add.collider(this.player, layer);
  //     // });
  //     // this.physics.add.overlap(this.monster.aggroZone, this.player, (aggroZone, player) => {
  //     //   aggroZone.setAggroTarget(player);
  //     // });
  //   };

  //   //These events should exist on every scene
  //   const scenePlayerLoadUnsubscribe = eventEmitter.subscribe("scenePlayerLoad", scenePlayerLoad);

  //   const nearbyPlayerLoadUnsubscribe = eventEmitter.subscribe("nearbyPlayerLoad", (players) => {
  //     console.log("phaser got nearbyPlayerLoad", players);
  //     let i = 0;
  //     let len = players.length;
  //     for (; i < len; i++) {
  //       const player = players[i];
  //       if (
  //         player.characterId !== this.player.characterId &&
  //         !this.otherPlayers[player.characterId]
  //       ) {
  //         this.otherPlayers[player.characterId] = new Player(
  //           this,
  //           player.xPos,
  //           player.yPos,
  //           `${player.name}-${player.characterId}`,
  //           player.templateName,
  //           false,
  //           player.characterId
  //         );
  //       }
  //     }
  //   });

  //   const otherPlayerPositionChanged = (stateSnapshots) => {
  //     //set a `move to` position, and let update take care of the rest
  //     //should consider making `moveTo` stateSnapshots a queue in case more events come in before
  //     //the player character has finished moving
  //     const remotePlayer = this.otherPlayers[stateSnapshots.characterId];
  //     if (remotePlayer) {
  //       remotePlayer.stateSnapshots = remotePlayer.stateSnapshots.concat(
  //         stateSnapshots.stateSnapshots
  //       );
  //     }
  //   };

  //   //this event lets us know that another player has moved, we should make this position move to
  //   //the position we received
  //   const otherPlayerPositionChangedUnsubscribe = eventEmitter.subscribe(
  //     "otherPlayerPositionChanged",
  //     otherPlayerPositionChanged
  //   );

  //   const otherPlayerLoad = (data) => {
  //     if (data.id !== this.player.id && !this.otherPlayers[data.id]) {
  //       this.otherPlayers[data.id] = new Player(
  //         this,
  //         data.xPos,
  //         data.yPos,
  //         `${data.name}-${data.id}`,
  //         data.templateName,
  //         false,
  //         data.id
  //       );
  //     }
  //   };
  //   //loads another player (not the main player) when receiving an otherPlayerLoad event from react
  //   const otherPlayerLoadUnsubscribe = eventEmitter.subscribe("otherPlayerLoad", otherPlayerLoad);
  //   //this has to go last because we need all our events setup before react starts dispatching events
  //   eventEmitter.emit("sceneLoad");

  //   //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
  super.create()
  }

  // this.pathfinder = createPathFinder(this.map, [
  //   this.groundLayer,
  //   this.worldLayer,
  //   this.belowCharLayer
  // ]);
  update(time, delta) {
    super.update(time, delta);
  }
}
