import "phaser";
import { Player } from "../entity/Player";
import { PathGrid } from "../pathfinding/PathGrid";
import { eventEmitter } from "../event/EventEmitter";
import { Monster } from "../entity/Monster";

export default class MMOScene extends Phaser.Scene {
  constructor() {
    super("MMOScene");
    this.playerData = {};
    this.otherPlayers = {};
    this.subscribes = [];
  }

  preload() {}

  create() {
    // eventEmitter.dispatch("requestPlayersOnMap");

    /**creating a map based on a tileset**/
    const map = this.make.tilemap({ key: "start-scene" }); //the key: should match what you specified in this.load.tilemapTiledJSON
    //tileSetName has to match the name of the tileset in Tiled, and the key is the image key we used for this tile set
    // const groundTiles = map.addTilesetImage("town", "town"); //loads the tileset used to make up this map
    const groundTiles = map.addTilesetImage("town", "town"); //loads the tileset used to make up this map

    this.groundLayer = map.createLayer("ground", groundTiles, 0, 0);
    // this.scale.resize(512, 384)
    this.worldLayer = map.createLayer("world", groundTiles, 0, 0);
    this.belowCharLayer = map.createLayer("belowChar", groundTiles, 0, 0);

    // collision
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.worldLayer.setCollisionByProperty({ collides: true });
    this.belowCharLayer.setCollisionByProperty({ collides: true });

    /*** collision debugging code ***/

    // const debugGraphics = this.add.graphics().setAlpha(0.75)
    // this.worldLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40,39, 37, 255)
    // })
    // this.groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40,39, 37, 255)
    // })
    // this.belowCharLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40,39, 37, 255)
    // })

    // groundLayer.setPipeline('Light2D');

    // groundLayer.setPipeline('Light2D');
    // groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    //These events should exist on every scene
    /*
     * loads a player in when receiving a playerLoad event from react
     * @param {{}} data
     */
    eventEmitter.subscribe("playerLoad", (data) => {
      console.log("playerLoad", data);
      this.playerData = data;
      this.player = new Player(
        this,
        data.xPos,
        data.yPos,
        "player",
        data.templateName,
        true,
        data.characterId
      );
      // this.player.setScale(.5, .5)
      this.cameras.main.startFollow(this.player);
      this.minimap = this.cameras
        .add(795, 0, 230, 230)
        .setZoom(0.15)
        .setName("mini")
        .startFollow(this.player);
      this.minimap.setBackgroundColor(0x002244);

      // this.minimap.scrollX = 820;
      // this.minimap.scrollY = 700;

      // Make the border
      // this.add.sprite(716, 85, "mini").setScale(2.52);

      this.minimap.centerOn(0, 0);
      const minimapCircle = new Phaser.GameObjects.Graphics(this);
      minimapCircle.fillCircle(910, 115, 110);
      minimapCircle.fillCircle(910, 115, 110, "mini");

      const circle = new Phaser.Display.Masks.GeometryMask(this, minimapCircle);
      this.minimap.setMask(circle, true);
      this.physics.add.collider(this.player, this.groundLayer);
      this.physics.add.collider(this.player, this.worldLayer);
      this.physics.add.collider(this.player, this.belowCharLayer);
    });

    this.monster = new Monster(this,200, 400, "ogre", "ogre", 1);

    /**
     * loads another player (not the main player) when receiving an otherPlayerLoad event from react
     */
    // eventEmitter.subscribe("otherPlayerLoad", (data) => {
    //   if (data.id !== this.player.id && !this.otherPlayers[data.id]) {
    //     this.otherPlayers[data.id] = new Player(
    //       this,
    //       data.x,
    //       data.y,
    //       `${data.name}-${data.id}`,
    //       data.templateName,
    //       false,
    //       data.id
    //     );
    //   }
    // });

    eventEmitter.subscribe("nearbyPlayerLoad", (players) => {
      console.log("phaser got nearbyPlayerLoad", players);
      let i = 0;
      let len = players.length;
      for (; i < len; i++) {
        const player = players[i];
        if (
          player.characterId !== this.player.characterId &&
          !this.otherPlayers[player.characterId]
        ) {
          this.otherPlayers[player.characterId] = new Player(
            this,
            player.xPos,
            player.yPos,
            `${player.name}-${player.characterId}`,
            player.templateName,
            false,
            player.characterId
          );
        }
      }
    });

    //this event lets us know that another player has moved, we should make this position move to
    //the position we received
    eventEmitter.subscribe("otherPlayerPositionChanged", (waypoints) => {
      //set a `move to` position, and let update take care of the rest
      //should consider making `moveTo` waypoints a queue in case more events come in before
      //the player character has finished moving
      const remotePlayer = this.otherPlayers[waypoints.characterId];
      if (remotePlayer) {
        remotePlayer.waypoints = remotePlayer.waypoints.concat(waypoints.waypoints);
      }
    });

    /**
     * loads another player (not the main player) when receiving an otherPlayerLoad event from react
     * @param data
     */
    eventEmitter.subscribe("otherPlayerLoad", (data) => {
      if (data.id !== this.player.id && !this.otherPlayers[data.id]) {
        let grid = new PathGrid(this, 100, this.groundLayer.width);
        this.otherPlayers[data.id] = new Player(
          this,
          grid,
          data.xPos,
          data.yPos,
          `${data.name}-${data.id}`,
          data.templateName,
          false,
          data.id
        );
      }
    });
    //this has to go last because we need all our events setup before react starts dispatching events
    eventEmitter.emit("phaserLoad");

    //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
  }

  /**anything that needs to update, should get it's update function called here**/
  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }
    if (this.otherPlayers) {
      for (const [id, player] of Object.entries(this.otherPlayers)) {
        player.update(time, delta);
      }
    }
    this.monster.update();
  }
}
