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
import { mapToScreen, screenToMap } from "../util/conversion";
import { PathFinder } from "../pathfinding/PathFinder";
import { Vector2 } from "../pathfinding/Vector2";

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
  constructor(scene, grid, x, y, spriteKey, name) {
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
    this.waypoints = [];
    this.previousWaypoint = null;
    this.nextWaypoint = null;
    this.currentWaypointIndex = 0;
    this.pathFinder = new PathFinder(this.scene, this, grid);
    this.moveUsingCursors = false;
    this.pdX = 0; //the delta between where the player currently is until the next waypoint
    this.pdY = 0;
    this.pvdX = 0; //the x velocity modifier when pathing
    this.pvdY = 0; //the y velocity modifier when pathing
    this.directionChanged = false;
    // this.setOrigin(0);

    //Physics
    this.scene.physics.world.enable(this);

    //Hotkeys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.createHotKeys();

    //Animations
    this.createAnimations();

    //Events
    this.createHotKeyEvents();

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
    //handles moving to a point when the user clicks on it
    this.scene.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      this.moveUsingCursors = false;
      this.clearPath();
      const { worldX, worldY } = pointer;
      let [endMapX, endMapY] = screenToMap(worldX, worldY);
      let startVector = this.getCurrentPosition();
      let endVector = new Vector2(endMapX, endMapY);
      console.log(startVector, endVector);
      const path = this.pathFinder.aStarPath(startVector, endVector);
      console.log("path", path);
      this.moveAlongPath(path);
    });

    this.scene.input.keyboard.on("keydown-" + "W", (event) => {
      this.clearPath();
      this.moveUsingCursors = true;
    });
    this.scene.input.keyboard.on("keydown-" + "A", (event) => {
      this.clearPath();
      this.moveUsingCursors = true;
    });
    this.scene.input.keyboard.on("keydown-" + "S", (event) => {
      this.clearPath();
      this.moveUsingCursors = true;
    });
    this.scene.input.keyboard.on("keydown-" + "D", (event) => {
      this.clearPath();
      this.moveUsingCursors = true;
    });
  }

  //changes the character from run to walk or vice-versa
  toggleMovementMode() {
    this.movementMode = this.movementMode === "walk" ? "run" : "walk";
  }

  update() {
    if (!this.moveUsingCursors) {
      this.updatePathMovement();
      this.pathMovement();
    } else {
      this.playAnimation();
    }
  }

  createAnimations() {
    const modes = ["idle", "walk", "run"];
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
    let vdX = 0;
    let vdY = 0;
    let numDirectionsPressed = 0;
    // if (cursors.up.isDown) {
    //   vdY = -1;
    //   direction =  NORTH;
    //   numDirectionsPressed++;
    // }
    // if (cursors.down.isDown) {
    //   vdY = 1;
    //   direction = SOUTH;
    //   numDirectionsPressed++;
    // }
    // if (cursors.right.isDown) {
    //   vdX = 1;
    //   direction = EAST;
    //   numDirectionsPressed++;
    // }
    // if (cursors.left.isDown) {
    //   vdX = -1;
    //   direction = WEST;
    //   numDirectionsPressed++;
    // }

    if (cursors.up.isDown) {
      vdY = -1;
      numDirectionsPressed++;
    } else if (cursors.down.isDown) {
      vdY = 1;
      numDirectionsPressed++;
    } else {
      vdY = 0;
    }
    if (cursors.right.isDown) {
      vdX = 1;
      if (vdY === 0) {
        direction = EAST;
      } else if (vdY === 1) {
        // direction = SOUTHEAST;
        direction = SOUTH; //we don't have animations for south east, so lets go with making the character face south
        vdX = vdY = 1;
      } else {
        // direction = NORTHEAST;
        direction = NORTH;
        vdX = 1;
        vdY = -1;
      }
      numDirectionsPressed++;
    } else if (cursors.left.isDown) {
      vdX = -1;
      if (vdY === 0) {
        direction = WEST;
      } else if (vdY === 1) {
        // direction = SOUTHWEST;
        direction = SOUTH;
        vdY = 1;
        vdX = -1;
      } else {
        // direction = NORTHWEST;
        direction = NORTH;
        vdX = -1;
        vdY = -1;
      }
      numDirectionsPressed++;
    } else {
      vdX = 0;
      if (vdY === 0) {
        //direction="west";
      } else if (vdY === 1) {
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
      vdX = 0;
      vdY = 0;
      this.mode = "idle";
    }
    return { vdX, vdY, direction };
  }

  playAnimation() {
    const { vdX, vdY, direction } = this.detectKeyInput();

    let mode = this.mode; //save the current
    const animationChanged = this.direction !== direction || this.mode !== mode;
    this.direction = direction;
    if (vdX !== 0 || vdY !== 0) {
      //player is moving
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : this.movementMode;
    } else {
      //player is standing still
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : "idle";
    }
    const animationToPlay = `${this.name}-${this.mode}-${this.direction}`;
    if (animationChanged || !this.anims.isPlaying) {
      this.anims.play(animationToPlay);
      this.animationChanged = false;
      this.directionChanged = false;
    }
    this.setVelocityX(this.speeds[this.movementMode] * vdX);
    this.setVelocityY(this.speeds[this.movementMode] * vdY);
  }

  /******************
   * Pathfinding    *
   ******************/

  pathMovement() {
    this.animationChanged = this.animationChanged || this.directionChanged;
    let mode = this.mode;
    const animationChanged = this.animationChanged || this.mode !== mode;
    if (this.pdX !== 0 || this.pdY !== 0) {
      //player is moving
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : this.movementMode;
    } else {
      //player is standing still
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : "idle";
    }
    let direction = DIRECTION_CONVERSION[this.direction];
    const animationToPlay = `${this.name}-${this.mode}-${direction}`;
    if (animationChanged || !this.anims.isPlaying) {
      console.log(animationToPlay);
      this.anims.play(animationToPlay);
      this.animationChanged = false;
    }
    this.setVelocityX(this.speeds[this.movementMode] * this.pvdX);
    this.setVelocityY(this.speeds[this.movementMode] * this.pvdY);
  }

  updatePathMovement() {
    if (this.nextWaypoint) {
      this.pdX = this.nextWaypoint.vector2.x - this.x;
      this.pdY = this.nextWaypoint.vector2.y - this.y;

      if (Math.abs(this.pdX) < 8) {
        this.pdX = 0;
      }
      if (Math.abs(this.pdY) < 8) {
        this.pdY = 0;
      }
      this.getMovementDirection(this.previousWaypoint, this.nextWaypoint);

      //reached the waypoint, get the next waypoint
      if (this.pdX === 0 && this.pdY === 0) {
        if (this.waypoints.length > 0) {
          this.previousWaypoint = this.nextWaypoint;
          let nextWaypoint = this.waypoints[this.currentWaypointIndex++];
          if (nextWaypoint) {
            this.setNextWaypoint(nextWaypoint);
          } else {
            this.pvdX = 0;
            this.pvdY = 0;
            this.nextWaypoint = undefined;
          }
        }
      }
    }
  }

  getMovementDirection(start, end) {
    let pdX = end.vector2.x - start.vector2.x;
    let pdY = end.vector2.y - start.vector2.y;
    let pvdX = 0;
    let pvdY = 0;
    let direction = this.direction;

    const east = pdX > 0;
    const west = pdX < 0;
    const north = pdY < 0;
    const south = pdY > 0;

    if (north) {
      pvdY = -1;
    } else if (south) {
      pvdY = 1;
    } else {
      pvdY = 0;
    }
    if (east) {
      pvdX = 1;
      if (pvdY === 0) {
        direction = EAST;
      } else if (pvdY === 1) {
        direction = SOUTHEAST;
        // pvdX = 1;
        // pvdY = 1;
        pvdX = 1;
        pvdY = 1;
      } else {
        direction = NORTHEAST;
        // pvdX = 1;
        // pvdY = -1;
        pvdX = 1;
        pvdY = -1;
      }
    } else if (west) {
      pvdX = -1;
      if (pvdY === 0) {
        direction = WEST;
      } else if (pvdY === 1) {
        direction = SOUTHWEST;
        // pvdY = 1;
        // pvdX = -1;
        pvdY = 1;
        pvdX = -1;
      } else {
        direction = NORTHWEST;
        // pvdX = -1;
        // pvdY = -1;
        pvdX = -1;
        pvdY = -1;
      }
    } else {
      pvdX = 0;
      if (pvdY === 0) {
        //direction="west";
      } else if (pvdY === 1) {
        direction = SOUTH;
      } else {
        direction = NORTH;
      }
    }
    this.pvdX = pvdX;
    this.pvdY = pvdY;
    this.directionChanged = direction !== this.direction;
    this.direction = direction;
    if (this.directionChanged) {
      console.log(`direction changed from ${direction} to ${this.direction}`);
    }
  }

  /**
   * returns the X,Y of the tile the player is standing on
   * @returns {Vector2}
   */
  getCurrentPosition() {
    const [mapCurX, mapCurY] = screenToMap(this.x, this.y);
    return new Vector2(mapCurX, mapCurY);
  }

  /**
   * moves a character to a given position
   * @param {Vector2} vector2
   */
  moveToTile(vector2) {
    const [screenX, screenY] = mapToScreen(vector2.x, vector2.y);
    this.x = screenX;
    this.y = screenY;
  }

  moveToCoordinate(x, y) {
    this.x = x; //+ playerXOffset;
    this.y = y; //+ playerYOffset;
  }

  clearPath() {
    this.pvdX = 0;
    this.pvdY = 0;
    this.pdX = 0;
    this.pdX = 0;
    this.isMoving = false;
    this.animationChanged = true;
    this.previousWaypoint = undefined;
    this.nextWaypoint = undefined;
    this.currentWaypointIndex = 0;
    this.isMoving = false;
  }

  /**
   *
   * @param {Node} node
   */
  setNextWaypoint(node) {
    this.nextWaypoint = node;
  }

  /**
   *
   * @param {Node[]} path
   */
  moveAlongPath(path) {
    if (!path || path.length <= 0) {
      return;
    }

    this.waypoints = path;
    this.previousWaypoint = this.waypoints[this.currentWaypointIndex];
    this.setNextWaypoint(this.waypoints[++this.currentWaypointIndex]);
  }
}
