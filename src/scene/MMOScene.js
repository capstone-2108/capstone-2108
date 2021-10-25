import "phaser";
import { eventEmitter } from "../event/EventEmitter";

import {
  localPlayerLogoutCallback,
  monsterCanAggroPlayerCallback, monsterControlFollowDirectionsCallback,
  monsterControlResetAggroCallback,
  nearbyMonsterLoadCallback,
  nearbyPlayerLoadCallback,
  remotePlayerHitMonster,
  remotePlayerChangedSceneCallback,
  remotePlayerLoadCallback,
  remotePlayerLogoutCallback,
  remotePlayerPositionChangedCallback,
  scenePlayerLoadCallback, monsterHasDiedCallback
} from '../event/callbacks';
import {RemotePlayer} from '../entity/RemotePlayer';
import {Monster} from '../entity/Monster';
import {Player} from '../entity/Player';

export default class MMOScene extends Phaser.Scene {
  constructor(sceneName) {
    super(sceneName);
    this.remotePlayers = {};
    this.monsters = {};
    this.unsubscribes = [];
    this.transitionZones = [];
  }

  preload() {
    this.monsterGroup = this.physics.add.group();
    this.monsterAggroZones = this.physics.add.group();
    this.playerGroup = this.physics.add.group();
  }

  create() {
    this.scene.run("minimapBorder");

    this.input.setDefaultCursor('url(images/FantasyCursor.cur), pointer');

    this.unsubscribes.push(
      eventEmitter.subscribe("disabledEvents", () => {
        console.log("disabledEvents", this);
        this.input.keyboard.enabled = false;
        this.input.keyboard.disableGlobalCapture();
      })
    );
    this.unsubscribes.push(
      eventEmitter.subscribe("enableKeyEvents", () => {
        this.input.keyboard.enabled = true;
        this.input.keyboard.enableGlobalCapture();
      })
    );

    this.unsubscribes.push(
      eventEmitter.subscribe("nearbyMonsterLoad", nearbyMonsterLoadCallback.bind(this))
    );

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
        "remotePlayerPositionChanged",
        remotePlayerPositionChangedCallback.bind(this)
      )
    );

    //loads another player (not the main player) when receiving an remotePlayerLoad event from react
    this.unsubscribes.push(
      eventEmitter.subscribe("remotePlayerLoad", remotePlayerLoadCallback.bind(this))
    );

    //react lets us know that a remote player has moved on to a different scene
    this.unsubscribes.push(
      eventEmitter.subscribe(
        "remotePlayerChangedScenes",
        remotePlayerChangedSceneCallback.bind(this)
      )
    );

    //server is letting us know that the monsters aggro request was approved, so we should initiate the aggro
    this.unsubscribes.push(
      eventEmitter.subscribe("monsterCanAggroPlayer", monsterCanAggroPlayerCallback.bind(this))
    );

    // //receiving an event to let us know that this monster needs to follow this path
    // this.unsubscribes.push(
    //   eventEmitter.subscribe("monsterAggroFollowPath", monsterAggroFollowPathCallback.bind(this))
    // );


    this.unsubscribes.push(
      eventEmitter.subscribe("monsterFollowDirections", monsterControlFollowDirectionsCallback.bind(this))
    );

    //receiving an event to let us know that a monster needs to reset it's aggro
    this.unsubscribes.push(
      eventEmitter.subscribe(
        "monsterControlResetAggro",
        monsterControlResetAggroCallback.bind(this)
      )
    );

    this.unsubscribes.push(
      eventEmitter.subscribe("monsterHasDied", monsterHasDiedCallback.bind(this))
    );


    //cleans up any unsubscribes
    this.unsubscribes.push(
      eventEmitter.subscribe("localPlayerLogout", localPlayerLogoutCallback.bind(this))
    );

    this.unsubscribes.push(
      eventEmitter.subscribe("remotePlayerLogout", remotePlayerLogoutCallback.bind(this))
    );
    //
    this.input.on("gameobjectdown", (pointer, gameObject) => {
      if (gameObject instanceof Player) {
        console.log("remote player", gameObject);
        gameObject.nameTag.setColor("#FFFFFF");
        eventEmitter.emit("requestPlayerInfo", gameObject.id);
      } else if (gameObject instanceof Monster) {
        eventEmitter.emit("requestMonsterInfo", gameObject.id);
      } else {
        console.log("error!!!");
      }
    });
    //this has to go last because we need all our events setup before react starts dispatching events
    eventEmitter.emit("sceneLoad");
  }

  /**anything that needs to update, should get it's update function called here**/
  update(time, delta) {
    if (this.player) {
      this.player.setActive(true);
      this.player.update(time, delta);
    }
    for (const [id, player] of Object.entries(this.remotePlayers)) {
      player.update(time, delta);
      if (!this.playerGroup.contains(player)) {
        this.playerGroup.add(player);
      }
    }
    for (const [id, monster] of Object.entries(this.monsters)) {
      if (!this.monsterGroup.contains(monster)) {
        this.monsterGroup.add(monster);
        this.physics.add.overlap(monster.aggroZone, this.player, (aggroZone, player) => {
          aggroZone.requestAggroOnTarget(this.player);
        });
      }
      monster.update(time, delta);
    }
  }

  cleanUp() {
    this.player.destroy();
    this.player = undefined;
    for (const [id, remotePlayer] of Object.entries(this.remotePlayers)) {
      remotePlayer.destroy();
    }
    this.remotePlayers = {};
    for (const [id, monster] of Object.entries(this.monsters)) {
      monster.aggroZone.destroy();
      monster.destroy();
    }
    this.monsters = {};
    this.unsubscribes.forEach((unsubscribe) => unsubscribe());
  }

  enableCollisionDebug(layer) {
    /*** collision debugging code ***/
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    layer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });
  }
}
