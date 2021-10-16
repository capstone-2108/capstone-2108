import "phaser";
import { Player } from "../entity/Player";
import { eventEmitter } from "../event/EventEmitter";
import { Monster } from "../entity/Monster";
import EasyStar from "easystarjs";

export default class MMOScene extends Phaser.Scene {
  constructor() {
    super("MMOScene");
    this.playerData = {};
    this.otherPlayers = {};
    this.subscribes = [];
  }

  preload() {}

  pathfinding(map, town, layers, monster) {
    this.finder = new EasyStar.js();
    this.finder.enableDiagonals();

    const tileset = map.tilesets[0];
    const tilesetProperties = tileset.tileProperties;


    const grid = [];
    const acceptableTiles = new Set();
    for (let col = 0; col < map.height; col++) {
      grid[col] = [];
      for (let row = 0; row < map.width; row++) {
        let finalTile;
        let collisionTile;
        for (let i = 0; i < layers.length; i++) {
          const proposedTile = map.getTileAt(row, col, true, layers[i]);
          if (proposedTile.index !== -1) {
            finalTile = proposedTile;
            const tileIndex = finalTile.index;
            if (tilesetProperties[tileIndex - 1].collides) {
              collisionTile = finalTile;
            } else {
              acceptableTiles.add(finalTile.index);
            }
          }
        }
        grid[col][row] = collisionTile ? collisionTile.index : finalTile.index;
      }
    }
    

    this.finder.setGrid(grid);
    this.finder.setAcceptableTiles(Array.from(acceptableTiles));

    const moveMonster = (path) => {
      if (path === null) {
        console.warn("Path was not found.");
        return;
      } else {
        console.log("PATHHHHH", path);
      }
      let pathIndex = 0;
      const intervalId = window.setInterval(() => {
        if (path[pathIndex]) {
          this.monster.x = path[pathIndex].x * 16;
          this.monster.y = path[pathIndex].y * 16;
          pathIndex++;
        } else {
          window.clearInterval(intervalId);
        }
      }, 100);
    };

    const handleClick = (pointer) => {
      //need access to this.monster
      let x = this.cameras.main.scrollX + pointer.x;
      let y = this.cameras.main.scrollY + pointer.y;
      let toX = Math.floor(x / 16);
      let toY = Math.floor(y / 16);
      let fromX = Math.floor(this.monster.x / 16);
      let fromY = Math.floor(this.monster.y / 16);

      console.log("going from (" + fromX + "," + fromY + ") to (" + toX + "," + toY + ")");
      this.finder.findPath(fromX, fromY, toX, toY, moveMonster);
      this.finder.calculate();
    };
    //window.setInterval clear the interval once the path is complete

    this.input.on("pointerup", handleClick);
  }

  create() {
    // eventEmitter.dispatch("requestPlayersOnMap");

    /**creating a map based on a tileset**/
    const map = this.make.tilemap({ key: "start-scene" }); //the key: should match what you specified in this.load.tilemapTiledJSON

    //tileSetName has to match the name of the tileset in Tiled, and the key is the image key we used for this tile set
    // const groundTiles = map.addTilesetImage("town", "town"); //loads the tileset used to make up this map
    const town = map.addTilesetImage("town", "town"); //loads the tileset used to make up this map

    this.groundLayer = map.createLayer("ground", town, 0, 0);

    // this.scale.resize(512, 384)
    this.worldLayer = map.createLayer("world", town, 0, 0);
    this.belowCharLayer = map.createLayer("belowChar", town, 0, 0);

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

    this.monster = new Monster(this, 200, 400, "orc", "orc", 1);
    this.monsterGroup = this.physics.add.group();
    this.monsterGroup.add(this.monster);
    this.pathfinding(
      map,
      town,
      [this.groundLayer, this.worldLayer, this.belowCharLayer],
      this.monster
    );

    //These events should exist on every scene
    /*
     * loads a player in when receiving a playerLoad event from react
     * @param {{}} data
     */
    eventEmitter.subscribe("playerLoad", (data) => {
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

      this.cameras.main.startFollow(this.player);
      this.minimap = this.cameras
        .add(795, 0, 230, 230)
        .setZoom(0.15)
        .setName("mini")
        .startFollow(this.player);
      this.minimap.setBackgroundColor(0x002244);

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
    eventEmitter.subscribe("otherPlayerPositionChanged", (stateSnapshots) => {
      //set a `move to` position, and let update take care of the rest
      //should consider making `moveTo` stateSnapshots a queue in case more events come in before
      //the player character has finished moving
      const remotePlayer = this.otherPlayers[stateSnapshots.characterId];
      if (remotePlayer) {
        remotePlayer.stateSnapshots = remotePlayer.stateSnapshots.concat(
          stateSnapshots.stateSnapshots
        );
      }
    });

    //loads another player (not the main player) when receiving an otherPlayerLoad event from react
    eventEmitter.subscribe("otherPlayerLoad", (data) => {
      if (data.id !== this.player.id && !this.otherPlayers[data.id]) {
        this.otherPlayers[data.id] = new Player(
          this,
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
    this.monster.update(time, delta);
  }
}
