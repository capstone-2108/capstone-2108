import "phaser";
import {
  DIRECTION_CONVERSION,
  DIRECTIONS,
  EAST,
  NORTH,
  NORTHEAST,
  NORTHWEST,
  SNAPSHOT_REPORT_INTERVAL,
  SOUTH,
  SOUTHEAST,
  SOUTHWEST,
  WEST
} from "../constants/constants";

import { eventEmitter } from "../event/EventEmitter";
import StateMachine from "../StateMachine";
import { createPlayerAnimation } from "../animation/createAnimations";

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} spriteKey
   * @param {string} name
   */
  constructor(scene, x, y, spriteKey, name, localPlayer = false, id) {
    super(scene, x, y, spriteKey);
    this.x = x;
    this.y = y;
    this.spriteKey = spriteKey;
    this.scene = scene;
    this.name = name; //the name of this character
    this.scene.add.existing(this); //adds this sprite to the scene
    this.setInteractive();
    this.speeds = {
      walk: 100,
      run: 150
    };
    this.mode = "idle"; //the mode of the player, idle, walking, running, attacking?
    this.direction = SOUTH; //the direction the character is facing or moving towards
    this.movementMode = "walk"; //the current movement mode, walk or run
    this.id = id; //the characterId of this player
    this.animationChanged = false;
    this.isInstant = false; //a flag to indicate that this state should only be transmitted once, such as an attack

    //Enable physics on this sprite
    this.scene.physics.world.enable(this);

    //Create all the animations, running, walking attacking, in all directions of movement
    createPlayerAnimation(this);

    /*************************
     * Multiplayer Variables *
     *************************/
    this.localPlayer = localPlayer; //am I a local player or remote player?
    this.stateSnapshots = []; //when this is set, a character will start following these stateSnapshots
    this.nextStatesSnapshot = null;
    this.lastReportTime = 0;
    this.stateSnapshotStartTime = null;

    /**this array stores snapshots of the local players movements so that we can let everyone else know about the later on**/
    this.localStateSnapshots = []; //this is where we hold snapshots of state before they are transmitted to the server
    this.snapShotsLen = 0;
    //the next 4 variables are used to determine if anything about a players movements have changed
    //we compare the last value against the current value to determine this
    this.lastVdx = 0;
    this.lastVdy = 0;
    this.lastDirection = this.direction;
    this.lastMode = this.mode;

    /*************************
     * Attack *
     *************************/
    this.meleeHitbox = this.scene.add.rectangle(this.x - 60, this.y - 60, 32, 64, 0xffffff, 0);
    this.scene.physics.add.existing(this.meleeHitbox);
    this.meleeHitbox.body.enable = false;
    this.scene.physics.world.remove(this.meleeHitbox.body);
    // this.scene.physics.world.addCollider(this, this.meleeHitbox);

    //if this is a local player then we need to setup keys for them to be able to move
    if (this.localPlayer) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.createHotKeys();
    }

    /*************************
     * State Machine *
     *************************/
    this.stateMachine = new StateMachine(this, name);
    this.stateMachine
      .addState("melee", {
        onEnter: this.meleeAttackEnter
      })
      .addState("idle", {
        onUpdate: this.idleStateUpdate
      });
    this.stateMachine.addState(`walk`, {
      onUpdate: this.walkStateUpdate
    });

    this.stateMachine.setState("idle");

    this.scene.physics.add.overlap(this.meleeHitbox, this.scene.monsterGroup, (player, target) => {
      // target.direction = 'east';
      target.stateMachine.setState("hit");
    });
  }

  idleStateUpdate() {
    this.animationPlayer(this.stateMachine.currentStateName);
  }

  walkStateUpdate() {
    this.animationPlayer(this.stateMachine.currentStateName);
  }

  meleeAttackEnter() {
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    const applyHitBox = (animation, frame) => {
      if (frame.index < 2) return;
      //here we're setting up where the attack box should go based on the character direction
      switch (convertedDir) {
        case NORTH:
          this.meleeHitbox.x = this.x - 16;
          this.meleeHitbox.y = this.y - 16;
          this.meleeHitbox.width = 64;
          this.meleeHitbox.height = 32;
          this.meleeHitbox.body.width = 64;
          this.meleeHitbox.body.height = 32;
          break;
        case SOUTH:
          this.meleeHitbox.x = this.x - 16;
          this.meleeHitbox.y = this.y + 48;
          this.meleeHitbox.width = 64;
          this.meleeHitbox.height = 32;
          this.meleeHitbox.body.width = 64;
          this.meleeHitbox.body.height = 32;
          break;
        case EAST:
          this.meleeHitbox.x = this.x + 32;
          this.meleeHitbox.y = this.y;
          this.meleeHitbox.width = 32;
          this.meleeHitbox.height = 64;
          this.meleeHitbox.body.width = 32;
          this.meleeHitbox.body.height = 64;
          break;
        case WEST:
          this.meleeHitbox.x = this.x - 32;
          this.meleeHitbox.y = this.y;
          this.meleeHitbox.width = 32;
          this.meleeHitbox.height = 64;
          this.meleeHitbox.body.width = 32;
          this.meleeHitbox.body.height = 64;
          break;
      }
      this.meleeHitbox.body.enable = true;
      this.scene.physics.world.add(this.meleeHitbox.body);
      this.off(Phaser.Animations.Events.ANIMATION_UPDATE, applyHitBox);
    };
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, applyHitBox);

    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "sorcerer-melee-" + convertedDir,
      () => {
        this.meleeHitbox.body.enable = false;
        this.scene.physics.world.remove(this.meleeHitbox.body);
        this.stateMachine.setState("idle");
        this.instant = false;
      }
    );
    this.animationPlayer("melee");
  }

  //plays the correct animation based on the players state
  animationPlayer(state) {
    const currentAnimationPlaying = this.anims.getName();
    let vdx = 0;
    let vdy = 0;
    let direction = this.direction;
    //get movement data based on player inputs
    if (this.localPlayer) {
      let moveData = this.detectKeyInput();
      vdx = moveData.vdx;
      vdy = moveData.vdy;
      direction = moveData.direction;
    }
    //get movement data based on the state snapshots
    if (!this.localPlayer && this.nextStatesSnapshot) {
      vdx = this.nextStatesSnapshot.vdx;
      vdy = this.nextStatesSnapshot.vdy;
      direction = this.getDirectionFromVelocity(vdx, vdy);
    }
    this.direction = direction;
    const convertedDir = DIRECTION_CONVERSION[this.direction];
    const animationToPlay = `${this.name}-${state}-${convertedDir}`;
    if (!this.anims.isPlaying || animationToPlay !== currentAnimationPlaying) {
      //if a different animation is playing, then lets change
      this.anims.play(animationToPlay);
    }
    this.setVelocityX(
      this.speeds.walk * (this.stateMachine.currentStateName === "melee" ? 0 : vdx)
    );
    this.setVelocityY(
      this.speeds.walk * (this.stateMachine.currentStateName === "melee" ? 0 : vdy)
    );
  }

  //creates hotkeys for the local player
  createHotKeys() {
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.scene.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      this.stateMachine.setState("melee");
    });
  }

  //changes the character from run to walk or vice-versa
  toggleMovementMode() {
    this.movementMode = this.movementMode === "walk" ? "run" : "walk";
  }

  update(time, delta) {
    if (this.localPlayer) {
      this.saveStateSnapshots(time, delta);
    } else {
      this.playRemotePlayerSnapshots(time, delta);
    }
    if (this.stateMachine.currentStateName !== "melee") {
      let vdx = 0;
      let vdy = 0;
      let direction = this.direction;
      if (this.localPlayer) {
        let moveData = this.detectKeyInput();
        vdx = moveData.vdx;
        vdy = moveData.vdy;
        direction = moveData.direction;
      }
      if (!this.localPlayer && this.nextStatesSnapshot) {
        vdx = this.nextStatesSnapshot.vdx;
        vdy = this.nextStatesSnapshot.vdy;
        direction = this.getDirectionFromVelocity(vdx, vdy);
      }
      this.direction = direction;
      if (this.localPlayer) {
        if (vdx !== 0 || vdy !== 0) {
          this.stateMachine.setState(`walk`); //we can only walk if we're not attacking
        } else {
          this.stateMachine.setState("idle");
        }
      } else {
        this.stateMachine.setState(
          this.nextStatesSnapshot ? this.nextStatesSnapshot.state : "idle"
        );
      }
    }
    this.stateMachine.update(time, delta);
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

  //for remote players, this handles advancing their state to the next snapshot
  playRemotePlayerSnapshots(time, delta) {
    let state = this.stateMachine.currentStateName;
    if (this.stateSnapshots.length && !this.nextStatesSnapshot) {
      this.setOtherPlayerNextStatesSnapshot(this.stateSnapshots.shift());
    }
    if (this.nextStatesSnapshot) {
      if (!this.stateSnapshotStartTime) {
        this.stateSnapshotStartTime = time;
        state = this.nextStatesSnapshot.state;
      }
      //switch to next stateSnapshot upon completion of this one
      if (time - this.stateSnapshotStartTime >= this.nextStatesSnapshot.duration) {
        this.moveToCoordinate(this.nextStatesSnapshot.endX, this.nextStatesSnapshot.endY);
        this.setOtherPlayerNextStatesSnapshot(this.stateSnapshots.shift());
        this.stateSnapshotStartTime = null;
      }
    }
    this.setState(state);
  }

  getVelocityFromDirection(direction) {
    let vdx = 0;
    let vdy = 0;
    switch (direction) {
      case NORTH:
        vdx = 0;
        vdy = -1;
        break;
      case NORTHEAST:
        vdx = 1;
        vdy = -1;
        break;
      case EAST:
        vdx = 1;
        vdy = 0;
        break;
      case SOUTHEAST:
        vdx = 1;
        vdy = 1;
        break;
      case SOUTH:
        vdx = 0;
        vdy = 1;
        break;
      case SOUTHWEST:
        vdy = 1;
        vdx = -1;
        break;
      case WEST:
        vdx = -1;
        vdy = 0;
        break;
      case NORTHWEST:
        vdx = -1;
        vdy = -1;
        break;
    }
    return { vdx, vdy };
  }

  getDirectionFromVelocity(vdx, vdy) {
    let direction = this.direction;
    if (vdy === 1) {
      //south
      direction = SOUTH;
      if (vdx === 1) {
        direction = SOUTHEAST;
      } else if (vdx === -1) {
        direction = SOUTHWEST;
      }
    } else if (vdy === -1) {
      //north
      direction = NORTH;
      if (vdx === 1) {
        direction = NORTHWEST;
      } else if (vdx === -1) {
        direction = NORTHWEST;
      }
    } else if (vdx === 1) {
      direction = EAST;
    } else if (vdx === -1) {
      direction = WEST;
    }
    return direction;
  }

  //instantly teleports a player to a given x, y location, does not respect collision or physics
  moveToCoordinate(x, y) {
    this.x = x;
    this.y = y;
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

  //for remote players, will set the next state stateSnapshot for movement / attacking
  setOtherPlayerNextStatesSnapshot(stateSnapshot) {
    this.nextStatesSnapshot = stateSnapshot;
  }
}
