import "phaser";
import { Player } from "../entity/Player";
import { eventEmitter } from "../event/EventEmitter";
import { Monster } from "../entity/Monster";
import { LocalPlayer } from "../entity/LocalPlayer";
import { RemotePlayer } from "../entity/RemotePlayer";

export default class MMOScene extends Phaser.Scene {
  constructor(sceneName) {
    console.log("sceneName", sceneName);
    super(sceneName);
    this.playerData = {};
    this.otherPlayers = {};
    this.subscribes = [];
  }

  preload() {}

  enableCollisionDebug(layer) {
    /*** collision debugging code ***/
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    layer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });
  }

  create() {
    this.monster = new Monster(this, 200, 400, "orc", "orc", 1);
    this.monsterGroup = this.physics.add.group();
    this.monsterGroup.add(this.monster);

    //These events should exist on every scene
    eventEmitter.subscribe("scenePlayerLoad", (data) => {
      this.playerData = data;
      this.player = new LocalPlayer(
        this,
        data.xPos,
        data.yPos,
        "player",
        data.templateName,
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
      this.physics.add.overlap(this.monster.aggroZone, this.player, (aggroZone, player) => {
        aggroZone.setAggroTarget(player);
      });
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
          this.otherPlayers[player.characterId] = new RemotePlayer(
            this,
            player.xPos,
            player.yPos,
            `${player.name}-${player.characterId}`,
            player.templateName,
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
      console.log('otherPlayerPositionChanged');
      console.log('otherPlayers', this.otherPlayers);
      const remotePlayer = this.otherPlayers[stateSnapshots.characterId];
      if (remotePlayer) {
        remotePlayer.stateSnapshots = remotePlayer.stateSnapshots.concat(
          stateSnapshots.stateSnapshots
        );
      }
    });

    //loads another player (not the main player) when receiving an otherPlayerLoad event from react
    const test = eventEmitter.subscribe("otherPlayerLoad", (data) => {
      if (data.id !== this.player.id && !this.otherPlayers[data.id]) {
        this.otherPlayers[data.id] = new Player(
          this,
          data.xPos,
          data.yPos,
          `${data.name}-${data.id}`,
          data.templateName,
          data.id
        );
      }
    });
    test();
    console.log('emitter', eventEmitter);
    //this has to go last because we need all our events setup before react starts dispatching events
    eventEmitter.emit("sceneLoad");

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
