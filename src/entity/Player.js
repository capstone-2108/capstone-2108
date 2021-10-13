import "phaser";
import {
  DIRECTION_CONVERSION,
  EAST,
  NORTH,
  NORTHEAST,
  NORTHWEST,
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
    this.name = name;
    this.scene.add.existing(this); //adds this sprite to the scene
    this.setInteractive();
    this.speeds = {
      walk: 100,
      run: 150
    };
    this.mode = "idle";
    this.direction = SOUTH;
    this.movementMode = "walk";
    this.animationChanged = false;
    this.waypointOverUnderShoot = false;
    this.reachedApproximateWaypoint = false;
    this.waypoints = [];
    this.nextWaypoint = null;
    this.directionChanged = false;
    this.mainPlayer = mainPlayer;
    this.id = id;
    this.positionChanged = false;
    this.lastReportTime = 0;
    this.posSinceLastReport = {
      x: this.x,
      y: this.y,
      direction: this.direction
    };
    this.lastDx = 0;
    this.lastDy = 0;
    this.moveSnapshots = [];
    this.snapShotsLen = 0;

    this.lastVdx = 0;
    this.lastVdy = 0;
    this.lastDirection = this.direction;
    this.lastMode = this.mode;
    this.waypointStartTime = null;

    //Physics
    this.scene.physics.world.enable(this);

    //Animations
    this.createAnimations();

    if (this.mainPlayer) {
      //Hotkeys
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.createHotKeys();

      //Events
      this.createHotKeyEvents();
    }

    // this.body.setOffset(32, 33);
    // this.movementModeChanged = false;
    // this.animationChanged = false; //if something triggers a change which should cause the current animation to change
    // this.speed = 100; //the speed of the player

    // this.setDepth(0);
    //
    //
    // //Lighting
    // this.followLight = this.scene.lights.addLight(this.x, this.y, 150).setIntensity(1.5);
    // this.scene.lights.enable().setAmbientColor(0xfffaf4);
    // this.followLight.x = this.x;
    // this.followLight.y = this.y;

    //Shadow
    // this.createShadow()

    //Sounds
    // this.createSound();
  }

  createHotKeys() {
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  createHotKeyEvents() {
    this.scene.input.keyboard.on("keydown-" + "W", (event) => {
      this.positionChanged = true;
    });
    this.scene.input.keyboard.on("keydown-" + "A", (event) => {
      this.positionChanged = true;
    });
    this.scene.input.keyboard.on("keydown-" + "S", (event) => {
      this.positionChanged = true;
    });
    this.scene.input.keyboard.on("keydown-" + "D", (event) => {
      this.positionChanged = true;
    });
  }

  //changes the character from run to walk or vice-versa
  toggleMovementMode() {
    this.movementMode = this.movementMode === "walk" ? "run" : "walk";
  }

  update(time, delta) {
    if (this.mainPlayer) {
      const {
        vdx: newVdx,
        vdy: newVdy,
        direction: newDirection,
        mode: newMode
      } = this.playAnimation();
      if (
        newVdx !== this.lastVdx ||
        newVdy !== this.lastVdy ||
        newDirection !== this.lastDirection ||
        (this.moveSnapshots.length === 0 && newMode !== "idle")
      ) {
        //take a snapshot
        const lastSnapshot = this.moveSnapshots[this.moveSnapshots.length - 1];
        if (lastSnapshot && !lastSnapshot.duration) {
          console.log("close snapshot at accumulate");
          lastSnapshot.duration = time - lastSnapshot.timeStarted;
          delete lastSnapshot.timeStarted;
          lastSnapshot.endX = Math.floor(this.x);
          lastSnapshot.endY = Math.floor(this.y);
        }
        if (newMode !== "idle") {
          this.moveSnapshots[this.snapShotsLen++] = {
            startX: Math.floor(this.x),
            startY: Math.floor(this.y),
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
      } else if (time - this.lastReportTime > 300 && this.moveSnapshots.length > 0) {
        const lastSnapshot = this.moveSnapshots[this.moveSnapshots.length - 1];
        if (lastSnapshot && !lastSnapshot.duration) {
          lastSnapshot.duration = time - lastSnapshot.timeStarted;
          delete lastSnapshot.timeStarted;
          lastSnapshot.endX = Math.floor(this.x);
          lastSnapshot.endY = Math.floor(this.y);
        }
        eventEmitter.emit("playerPositionChanged", {
          characterId: this.id,
          waypoints: this.moveSnapshots
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
      //this isn't the local player
      //check for way points
      //if waypoints found, start playing them
      //switch to next waypoint upon completion of this one

      if (this.waypoints.length && !this.nextWaypoint) {
        this.setOtherPlayerNextWaypoint(this.waypoints.shift());
      }
      if (this.nextWaypoint) {
        if (!this.waypointStartTime) {
          this.waypointStartTime = time;
        }
        if (time - this.waypointStartTime >= this.nextWaypoint.duration) {
          this.moveToCoordinate(this.nextWaypoint.endX, this.nextWaypoint.endY);
          this.setOtherPlayerNextWaypoint(this.waypoints.shift());
          this.waypointStartTime = null;
        }
      }
      this.playOtherPlayerAnimations(this.nextWaypoint);
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

  // update(time, delta) {
  //   if (this.mainPlayer) {
  //     this.playAnimation();
  //     //send a position update every 250ms
  //     if (time - this.lastReportTime > 50) {
  //       if (
  //         this.directionChanged ||
  //         this.x !== this.posSinceLastReport.x ||
  //         this.y !== this.posSinceLastReport.y
  //       ) {
  //         eventEmitter.emit("playerPositionChanged", {
  //           characterId: this.id,
  //           x: this.x,
  //           y: this.y,
  //           direction: this.direction
  //         });
  //         this.posSinceLastReport = {
  //           x: this.x,
  //           y: this.y,
  //           direction: this.direction
  //         };
  //       }
  //       this.lastReportTime = time;
  //     }
  //   } else {
  //     // this is another player, not the main player
  //     // check for waypoints, if so, then move
  //     let vdx = 0;
  //     let vdy = 0;
  //
  //     //load up the next way point if there are waypoints to process and the nextwaypoint us null/undefined
  //     if (this.waypoints.length > 0 && !this.nextWaypoint) {
  //       this.setOtherPlayerNextWaypoint(this.waypoints.shift());
  //       // console.log("setting waypoint", this.nextWaypoint);
  //     }
  //
  //     //player has a waypoint,
  //     if (this.nextWaypoint) {
  //       //player has approximately arrived
  //       if (this.otherPlayerLostSync(this.nextWaypoint)) {
  //         console.log("lost sync");
  //         //if the dx or dy start increasing the player has lost sync and must be reset, this can happen at high latency
  //         // this.moveToCoordinate(this.nextWaypoint.x, this.nextWaypoint.y);
  //       } else if (this.otherPlayerArrivedAtWaypoint(this.nextWaypoint)) {
  //         //this is a dirty fix to have the player be at the position they need to be
  //         this.moveToCoordinate(this.nextWaypoint.x, this.nextWaypoint.y);
  //         this.setOtherPlayerNextWaypoint(this.waypoints.shift());
  //         this.lastDx = 0;
  //         this.lastDy = 0;
  //       }
  //
  //       if (this.nextWaypoint) {
  //         //if there is a waypoint, lets try to move closer to it
  //         // console.log("nextWaypoint", this.nextWaypoint);
  //         this.directionChanged = this.direction !== this.nextWaypoint.direction;
  //         const velocityData = this.getOtherPlayerVelocityModifiers(this.nextWaypoint);
  //         this.direction = this.nextWaypoint.direction;
  //         vdx = velocityData.vdx;
  //         vdy = velocityData.vdy;
  //         let {dy, dx} = this.getDistanceToWaypoint(this.nextWaypoint);
  //         this.lastDx = dx;
  //         this.lastDy = dy;
  //       }
  //
  //     }
  //     this.playOtherPlayerAnimations(vdx, vdy);
  //   }
  // }

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
        // direction = SOUTH; //we don't have animations for south east, so lets go with making the character face south
        vdx = vdy = 1;
      } else {
        direction = NORTHEAST;
        // direction = NORTH;
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
        // direction = SOUTH;
        vdy = 1;
        vdx = -1;
      } else {
        direction = NORTHWEST;
        // direction = NORTH;
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

  playAnimation() {
    const { vdx, vdy, direction } = this.detectKeyInput();
    let mode = this.mode; //save the current
    this.directionChanged = direction !== this.direction;
    this.localReportingDirectionChanged = this.directionChanged;
    const animationChanged = this.directionChanged || this.mode !== mode;
    this.direction = direction;
    if (vdx !== 0 || vdy !== 0) {
      //player is moving
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : this.movementMode;
      mode = this.mode;
    } else {
      //player is standing still
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : "idle";
      mode = this.mode;
    }
    let convertedDir = DIRECTION_CONVERSION[direction];
    const animationToPlay = `${this.name}-${this.mode}-${convertedDir}`;
    if (animationChanged || !this.anims.isPlaying) {
      this.anims.play(animationToPlay);
      this.animationChanged = false;
      this.directionChanged = false;
    }
    this.setVelocityX(this.speeds[this.movementMode] * vdx);
    this.setVelocityY(this.speeds[this.movementMode] * vdy);
    return { vdx, vdy, direction, mode };
  }

  /*********************************************************************************
   * Other Player Functions
   *
   * These functions are used when this is a remote player, and not the main player
   ********************************************************************************/

  /**
   * plays the proper animation for other players
   */
  playOtherPlayerAnimations(waypoint) {
    let vdx = 0;
    let vdy = 0;
    let direction = this.direction;
    if (waypoint) {
      vdx = waypoint.vdx;
      vdy = waypoint.vdy;
      this.direction = this.getDirectionFromVelocity(vdx, vdy);
    }
    this.animationChanged = this.animationChanged || direction !== this.direction;
    let mode = this.mode;

    if (vdx !== 0 || vdy !== 0) {
      //player is moving
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : this.movementMode;
    } else {
      //player is standing still
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : "idle";
    }
    const animationChanged = this.animationChanged || this.mode !== mode;
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    const animationToPlay = `${this.name}-${this.mode}-${convertedDir}`;
    if (animationChanged || !this.anims.isPlaying) {
      this.anims.play(animationToPlay);
      this.animationChanged = false;
      this.directionChanged = false;
    }
    this.setVelocityX(this.speeds[this.movementMode] * vdx);
    this.setVelocityY(this.speeds[this.movementMode] * vdy);
  }

  setOtherPlayerNextWaypoint(waypoint) {
    this.nextWaypoint = waypoint;
  }
}
