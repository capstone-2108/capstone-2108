import { DIRECTION_CONVERSION } from "../constants/constants";
import { MONSTER_STATES } from "./MonsterStates";
import { Monster } from "./Monster";

const { Player } = require("./Player");
const {
  SNAPSHOT_REPORT_INTERVAL,
  EAST,
  SOUTHEAST,
  NORTHEAST,
  WEST,
  SOUTHWEST,
  NORTHWEST,
  SOUTH,
  NORTH
} = require("../constants/constants");
const { eventEmitter } = require("../event/EventEmitter");

export class LocalPlayer extends Player {
  constructor(scene, x, y, spriteKey, templateName, characterName, id) {
    super(scene, x, y, spriteKey, templateName, characterName, id, true);
    // this.cursors = this.scene.input.keyboard.createCursorKeys();

    /*************************
     * Multiplayer Variables *
     *************************/
    /**this array stores snapshots of the local players movements so that we can let everyone else know about the later on**/
    this.localStateSnapshots = []; //this is where we hold snapshots of state before they are transmitted to the server
    this.snapShotsLen = 0;
    this.lastReportTime = 0;
    //the next 4 variables are used to determine if anything about a players movements have changed
    //we compare the last value against the current value to determine this
    this.lastVdx = 0;
    this.lastVdy = 0;
    this.lastDirection = this.direction;
    this.lastMode = this.mode;

    this.createHotKeys();
  }

  createHotKeys() {
    this.scene.input.keyboard.enabled = true;

    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer) => {
      if (pointer.rightButtonDown()) {
        this.stateMachine.setState("melee");
      }
    });

    let oneKey = this.scene.input.keyboard.addKey('One');
    oneKey.on('down', () => {
      this.stateMachine.setState("idle");
    });
  }

  update(time, delta) {
    this.saveStateSnapshots(time, delta);
    if (this.stateMachine.currentStateName !== "melee") {
      let moveData = this.detectKeyInput();
      let vdx = moveData.vdx;
      let vdy = moveData.vdy;
      let direction = moveData.direction;
      this.direction = direction;
        if (vdx !== 0 || vdy !== 0) {
          this.stateMachine.setState(`walk`); //we can only walk if we're not attacking
        }
        else {
          this.stateMachine.setState("idle");
        }
    }
    this.stateMachine.update(time, delta);
    super.update(time, delta);
  }

  //saves snapshots of the local players state, which will be transmitted to the server later on
  saveStateSnapshots(time, delta) {
    const lastSnapshot = this.localStateSnapshots[this.localStateSnapshots.length - 1];
    let moveData = this.detectKeyInput();
    let newVdx = moveData.vdx;
    let newVdy = moveData.vdy;
    let newDirection = moveData.direction;
    let newState = this.stateMachine.currentStateName;
    //if something about this characters movement has changed then we should start a new snapshot
    if (
      newVdx !== this.lastVdx ||
      newVdy !== this.lastVdy ||
      newDirection !== this.lastDirection ||
      (this.localStateSnapshots.length === 0 && newState !== "idle" && !this.instant)
    ) {
      if (newState === "melee") {
        this.instant = true;
      }
      if (lastSnapshot && !lastSnapshot.duration) {
        lastSnapshot.duration = time - lastSnapshot.timeStarted;
        delete lastSnapshot.timeStarted;
        lastSnapshot.endX = Math.floor(this.x);
        lastSnapshot.endY = Math.floor(this.y);
      }
      if (newState !== "idle") {
        this.localStateSnapshots[this.snapShotsLen++] = {
          endX: undefined,
          endY: undefined,
          vdx: newVdx,
          vdy: newVdy,
          timeStarted: time,
          state: newState === "" ? "idle" : newState,
          duration: undefined
        };
      }
      this.lastVdx = newVdx;
      this.lastVdy = newVdy;
      this.lastDirection = newDirection;
      this.lasState = newState;
    } else if (
      time - this.lastReportTime > SNAPSHOT_REPORT_INTERVAL &&
      this.localStateSnapshots.length > 0
    ) {
      //we send all the snapshots we've taken every given interval, providing there are any
      if (lastSnapshot && !lastSnapshot.duration) {
        lastSnapshot.duration = time - lastSnapshot.timeStarted;
        delete lastSnapshot.timeStarted;
        lastSnapshot.endX = Math.floor(this.x);
        lastSnapshot.endY = Math.floor(this.y);
      }

      eventEmitter.emit("phaserUpdate", {
        action: "playerPositionChanged",
        data: {
          characterId: this.id,
          stateSnapshots: this.localStateSnapshots
        }
      });
      this.localStateSnapshots = [];
      this.snapShotsLen = 0;
      this.lastReportTime = time;
      this.lastVdx = newVdx;
      this.lastVdy = newVdy;
      this.lastDirection = newDirection;
      this.lastState = newState;
    }
  }

  //returns velocity modifiers and the direction the character is facing/moving based on player inputs
  detectKeyInput() {
    const cursors = this.cursors;
    let direction = this.direction;
    let vdx = 0;
    let vdy = 0;
    let numDirectionsPressed = 0;

    if (cursors.up.isDown) {
      vdy = -1;
      numDirectionsPressed++;
    } else if (cursors.down.isDown) {
      vdy = 1;
      numDirectionsPressed++;
    } else {
      vdy = 0;
    }
    if (cursors.right.isDown) {
      vdx = 1;
      if (vdy === 0) {
        direction = EAST;
      } else if (vdy === 1) {
        direction = SOUTHEAST;
        vdx = vdy = 1;
      } else {
        direction = NORTHEAST;
        vdx = 1;
        vdy = -1;
      }
      numDirectionsPressed++;
    } else if (cursors.left.isDown) {
      vdx = -1;
      if (vdy === 0) {
        direction = WEST;
      } else if (vdy === 1) {
        direction = SOUTHWEST;
        vdy = 1;
        vdx = -1;
      } else {
        direction = NORTHWEST;
        vdx = -1;
        vdy = -1;
      }
      numDirectionsPressed++;
    } else {
      vdx = 0;
      if (vdy === 0) {
        //direction="west";
      } else if (vdy === 1) {
        direction = SOUTH;
      } else {
        direction = NORTH;
      }
    }

    if (
      numDirectionsPressed === 0 ||
      numDirectionsPressed > 2 ||
      (cursors.left.isDown && cursors.right.isDown) ||
      (cursors.up.isDown && cursors.down.isDown)
    ) {
      vdx = 0;
      vdy = 0;
    }
    return { vdx, vdy, direction };
  }
}
