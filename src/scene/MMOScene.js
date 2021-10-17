import "phaser";
import { Player } from "../entity/Player";
import { eventEmitter } from "../event/EventEmitter";
import { Monster } from "../entity/Monster";

import {
  nearbyPlayerLoadCallback,
  otherPlayerLoadCallback,
  remotePlayerPositionChangedCallback,
  scenePlayerLoadCallback
} from "../event/callbacks";

export default class MMOScene extends Phaser.Scene {
  constructor(sceneName) {
    super(sceneName);
    this.otherPlayers = {};
    this.unsubscribes = [];
    this.transitionZones = [];
    this.monsterGroup = undefined;
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
    this.unsubscribes.push(
      eventEmitter.subscribe("scenePlayerLoad", scenePlayerLoadCallback.bind(this))
    );
    this.unsubscribes.push(
      eventEmitter.subscribe("nearbyPlayerLoad", nearbyPlayerLoadCallback.bind(this))
    );
    // //this event lets us know that another player has moved,
    this.unsubscribes.push(
      eventEmitter.subscribe(
        "otherPlayerPositionChanged",
        remotePlayerPositionChangedCallback.bind(this)
      )
    );
    //loads another player (not the main player) when receiving an otherPlayerLoad event from react
    this.unsubscribes.push(
      eventEmitter.subscribe("otherPlayerLoad", otherPlayerLoadCallback.bind(this))
    );
    //this has to go last because we need all our events setup before react starts dispatching events
    eventEmitter.emit("sceneLoad");
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
    if (this.monster) {
      this.monster.update(time, delta);
    }
  }
}
