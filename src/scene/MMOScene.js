import "phaser";
import { Player } from "../entity/Player";
import { PathGrid } from "../pathfinding/PathGrid";
import { eventEmitter } from "../event/EventEmitter";

export default class MMOScene extends Phaser.Scene {
  constructor() {
    super("MMOScene");
    this.playerData = {};
  }

  preload() {}

  create() {
    // eventEmitter.dispatch("requestPlayersOnMap");

    /**creating a map based on a tileset**/
    const map = this.make.tilemap({ key: "start-scene" }); //the key: should match what you specified in this.load.tilemapTiledJSON
    //tileSetName has to match the name of the tileset in Tiled, and the key is the image key we used for this tile set
    const groundTiles = map.addTilesetImage("town", "town"); //loads the tileset used to make up this map
    this.groundLayer = map.createLayer("ground", groundTiles, 0, 0);
    map.createLayer("world", groundTiles, 0, 0);
    map.createLayer("belowChar", groundTiles, 0, 0);

    // groundLayer.setPipeline('Light2D');

    // groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    //These events should exist on every
    this.otherPlayers = {};
    eventEmitter.addEventListener("playerLoad", (data) => {
      console.log("playerLoad", data, this.groundLayer);
      this.playerData = data;
      let grid = new PathGrid(this, 100, this.groundLayer.width);
      this.player = new Player(
        this,
        grid,
        this.playerData.xPos,
        this.playerData.yPos,
        "player",
        this.playerData.templateName,
        true,
        this.playerData.id
      );
      this.cameras.main.startFollow(this.player);
    });

    eventEmitter.addEventListener("otherPlayerLoad", (data) => {
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
    eventEmitter.dispatch("phaserLoad");
  }

  /**anything that needs to update, should get it's update function called here**/
  update(time, delta) {
    if (this.player) {
      this.player.update();
    }
    if (this.otherPlayers) {
      for (const [id, player] of Object.entries(this.otherPlayers)) {
        player.update();
      }
    }
  }

  /*
   * loads a player in when receiving a playerLoad event from react
   * @param {{}} data
   */
  playerLoad;

  /**
   * loads another player (not the main player) when receiving an otherPlayerLoad event from react
   * @param data
   */
}
