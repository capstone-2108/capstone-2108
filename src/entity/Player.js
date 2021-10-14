import "phaser";
import {
  DIRECTION_CONVERSION,
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

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {PathGrid} grid
   * @param {number} x
   * @param {number} y
   * @param {string} spriteKey
   * @param {string} name
   */
  constructor(scene, x, y, spriteKey, name, mainPlayer = false, id) {
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

    //Enable physics on this sprite
    this.scene.physics.world.enable(this);

    //Create all the animations, running, walking attacking, in all directions of movement
    this.createAnimations();

    /*************************
     * Multiplayer Variables *
     *************************/
    this.mainPlayer = mainPlayer; //am I a local player or remote player?
    this.waypoints = []; //when this is set, a character will start following these waypoints
    this.nextWaypoint = null;
    this.lastReportTime = 0;
    this.waypointStartTime = null;

    /**this array stores snapshots of the local players movements so that we can let everyone else know about the later on**/
    this.moveSnapshots = [];
    this.snapShotsLen = 0;
    //the next 4 variables are used to determine if anything about a players movements have changed
    //we compare the last value against the current value to determine this
    this.lastVdx = 0;
    this.lastVdy = 0;
    this.lastDirection = this.direction;
    this.lastMode = this.mode;

    //if this is a local player then we need to setup keys for them to be able to move
    if (this.mainPlayer) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.createHotKeys();
    }
  }

  createHotKeys() {
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  //changes the character from run to walk or vice-versa
  toggleMovementMode() {
    this.movementMode = this.movementMode === "walk" ? "run" : "walk";
  }

  update(time, delta) {
    if (this.mainPlayer) {
      const lastSnapshot = this.moveSnapshots[this.moveSnapshots.length - 1];
      const {
        vdx: newVdx,
        vdy: newVdy,
        direction: newDirection,
        mode: newMode
      } = this.playAnimation();

      //if something about this characters movement has changed then we should start a new snapshot
      if (
        newVdx !== this.lastVdx ||
        newVdy !== this.lastVdy ||
        newDirection !== this.lastDirection ||
        (this.moveSnapshots.length === 0 && newMode !== "idle")
      ) {
        if (lastSnapshot && !lastSnapshot.duration) {
          lastSnapshot.duration = time - lastSnapshot.timeStarted;
          delete lastSnapshot.timeStarted;
          lastSnapshot.endX = Math.floor(this.x);
          lastSnapshot.endY = Math.floor(this.y);
        }
        if (newMode !== "idle") {
          this.moveSnapshots[this.snapShotsLen++] = {
            // startX: Math.floor(this.x),
            // startY: Math.floor(this.y),
            endX: undefined,
            endY: undefined,
            vdx: newVdx,
            vdy: newVdy,
            timeStarted: time,
            duration: undefined
          };
        }
        this.lastVdx = newVdx;
        this.lastVdy = newVdy;
        this.lastDirection = newDirection;
        this.lastMode = newMode;
      } else if (
        time - this.lastReportTime > SNAPSHOT_REPORT_INTERVAL &&
        this.moveSnapshots.length > 0
      ) {
        //we send all the snapshots we've taken every given interval, providing there are any
        if (lastSnapshot && !lastSnapshot.duration) {
          lastSnapshot.duration = time - lastSnapshot.timeStarted;
          delete lastSnapshot.timeStarted;
          lastSnapshot.endX = Math.floor(this.x);
          lastSnapshot.endY = Math.floor(this.y);
        }
        eventEmitter.emit("phaserUpdate", {
          action: 'playerPositionChanged',
          data: {
            characterId: this.id,
            waypoints: this.moveSnapshots
          }
        });
        this.moveSnapshots = [];
        this.snapShotsLen = 0;
        this.lastReportTime = time;
        this.lastVdx = newVdx;
        this.lastVdy = newVdy;
        this.lastDirection = newDirection;
        this.lastMode = newMode;
      }
    } else {
      //we handle movement for remote players here
      if (this.waypoints.length && !this.nextWaypoint) {
        this.setOtherPlayerNextWaypoint(this.waypoints.shift());
      }
      if (this.nextWaypoint) {
        if (!this.waypointStartTime) {
          this.waypointStartTime = time;
        }
        //switch to next waypoint upon completion of this one
        if (time - this.waypointStartTime >= this.nextWaypoint.duration) {
          this.moveToCoordinate(this.nextWaypoint.endX, this.nextWaypoint.endY);
          this.setOtherPlayerNextWaypoint(this.waypoints.shift());
          this.waypointStartTime = null;
        }
      }
      this.playAnimation(this.nextWaypoint);
    }
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

  moveToCoordinate(x, y) {
    this.x = x;
    this.y = y;
  }

  createAnimations() {
    const modes = ["idle", "walk" /*"run"*/];
    const directions = {
      [NORTH]: { start: 12, end: 15 },
      [EAST]: { start: 8, end: 11 },
      [SOUTH]: { start: 0, end: 3 },
      [WEST]: { start: 4, end: 7 }
    };

    for (const [dir, dirOptions] of Object.entries(directions)) {
      for (const mode of modes) {
        const animationName = `${this.name}-${mode}-${dir}`; //what to call the animation so we can refer to it later
        const atlasKey = `${this.name}`; //which atlas should we use
        this.anims.create({
          key: animationName,
          frameRate: 10,
          frames: this.anims.generateFrameNames(atlasKey, {
            prefix: `${atlasKey}_${mode}-`, //this will match the file name in the .json file for this atlas
            suffix: ".png",
            start: dirOptions.start,
            end: dirOptions.end,
            repeat: -1
          })
        });
      }
    }
  }

  //assign direction for character & set x,y speed components
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
      this.mode = "idle";
    }
    return { vdx, vdy, direction };
  }

  playAnimation(waypoint = undefined) {
    let vdy = 0;
    let vdx = 0;
    let direction = this.direction;
    let animationChanged = false;
    if (!this.mainPlayer && waypoint) {
      //remote player
      vdx = waypoint.vdx;
      vdy = waypoint.vdy;
      this.direction = this.getDirectionFromVelocity(vdx, vdy);
    } else if (this.mainPlayer) {
      //local player
      let localPlayerMoveData = this.detectKeyInput();
      vdx = localPlayerMoveData.vdx;
      vdy = localPlayerMoveData.vdy;
      this.direction = localPlayerMoveData.direction;
    }
    let mode = this.mode; //save the current mode

    //if there is velocity, then the player is considered to be moving
    if (vdx !== 0 || vdy !== 0) {
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : this.movementMode;
      mode = this.mode;
    } else {
      //player is standing still
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : "idle";
      mode = this.mode;
    }

    //note if the direction changed or if the mode changed, if so, then we have to play a different animation
    animationChanged = direction !== this.direction || this.mode !== mode;
    direction = this.direction;

    let convertedDir = DIRECTION_CONVERSION[direction];
    const animationToPlay = `${this.name}-${this.mode}-${convertedDir}`;
    if (animationChanged || !this.anims.isPlaying) {
      this.anims.play(animationToPlay);
    }
    this.setVelocityX(this.speeds[this.movementMode] * vdx);
    this.setVelocityY(this.speeds[this.movementMode] * vdy);
    return { vdx, vdy, direction, mode };
  }

  setOtherPlayerNextWaypoint(waypoint) {
    this.nextWaypoint = waypoint;
  }
}
