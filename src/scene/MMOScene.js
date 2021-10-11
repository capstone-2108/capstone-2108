import "phaser";
import { Player } from "../entity/Player";
import { PathGrid } from "../pathfinding/PathGrid";
import { eventEmitter } from "../event/EventEmitter";

export default class MMOScene extends Phaser.Scene {
  constructor() {
    super("MMOScene");
    this.playerData = {};
    this.otherPlayers = {};
  }

  preload() {}

  create() {
    // eventEmitter.dispatch("requestPlayersOnMap");

    /**creating a map based on a tileset**/
    const map = this.make.tilemap({ key: "start-scene" }); //the key: should match what you specified in this.load.tilemapTiledJSON
    //tileSetName has to match the name of the tileset in Tiled, and the key is the image key we used for this tile set
    const groundTiles = map.addTilesetImage("town", "town"); //loads the tileset used to make up this map
    this.groundLayer = map.createLayer("ground", groundTiles, 0, 0);
    this.worldLayer = map.createLayer("world", groundTiles, 0, 0);
    this.belowCharLayer = map.createLayer("belowChar", groundTiles, 0, 0);

    // collision
    this.groundLayer.setCollisionByProperty({ collides: true})
    this.worldLayer.setCollisionByProperty({ collides: true})
    this.belowCharLayer.setCollisionByProperty({ collides: true})


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
    // map.createLayer('house', groundTiles, 0, 0);
    // map.createLayer('Tile Layer 5', groundTiles, 0, 0);
    // map.createLayer('rocks', groundTiles, 0, 0);

    // groundLayer.setPipeline('Light2D');
    // groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    //These events should exist on every
      /*
   * loads a player in when receiving a playerLoad event from react
   * @param {{}} data
   */
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
      this.minimap = this.cameras
      .add(795, 0, 230, 230)
      .setZoom(0.3)
      .setName("mini")
      .startFollow(this.player);
    this.minimap.setBackgroundColor(0x002244);

    // this.minimap.scrollX = 820;
    // this.minimap.scrollY = 700;
    this.minimap.centerOn(0, 0);
    const minimapCircle = new Phaser.GameObjects.Graphics(this);
    minimapCircle.fillCircle(910, 115, 110);
    const circle = new Phaser.Display.Masks.GeometryMask(this, minimapCircle);
    this.minimap.setMask(circle, true);
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.worldLayer);
    this.physics.add.collider(this.player, this.belowCharLayer);
    });

      /**
   * loads another player (not the main player) when receiving an otherPlayerLoad event from react
   * @param data
   */
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

    //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2



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
}
