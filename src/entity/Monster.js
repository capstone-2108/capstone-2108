import {
  DIRECTION_CONVERSION,
  EAST,
  NORTH,
  SOUTH,
  WEST
} from "../constants/constants";
import StateMachine from "../StateMachine";
import { mapToScreen, screenToMap } from "../util/conversion";
import { AggroZone } from "./AggroZone";
import { createMonsterAnimations } from "../animation/createAnimations";

export class Monster extends Phaser.Physics.Arcade.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} spriteKey
   * @param {string} name
   * @param {number} id the monster id
   */
  constructor(scene, x, y, spriteKey, name, id) {
    super(scene, x, y, spriteKey);
    this.x = x;
    this.y = y;
    this.spriteKey = spriteKey;
    this.scene = scene;
    this.name = name; //the name of this character
    this.scene.add.existing(this); //adds this sprite to the scene
    this.setInteractive();
    this.speeds = {
      walk: 80,
      run: 150
    };
    this.mode = "idle"; //the mode of the player, idle, walking, running, attacking?
    this.direction = SOUTH; //the direction the character is facing or moving towards
    this.movementMode = "walk"; //the current movement mode, walk or run
    this.id = id; //the characterId of this player

    //the original position of the monster
    this.spawnPoint = screenToMap(this.x, this.y);

    //Pathfinding
    this.pathIntervalId = undefined; //for testing purposes, an intervalId for the interval which is moving the monster through path nodes
    this.pathId = undefined; //an integer identifier for the last path generated
    this.waypoints = []; //waypoints of the current path
    this.waypointIdx = 0; //index of the current path node
    this.nextWaypoint = undefined; //the next waypoint to travel to
    this.previousWaypoint = undefined;

    this.vdx = 0; //modifies X velocity (negative: west, positive: east, 0: not moving)
    this.vdy = 0;  //modifies Y velocity (negative: north, positive: south, 0: not moving)
    this.dx = 0;
    this.dy = 0;

    //Monster Aggro Zone
    this.aggroZone = new AggroZone(this.scene, this.x, this.y, 100, 100, this);
    this.scene.monsterAggroZones.add(this.aggroZone);

    //Enable physics on this sprite
    this.scene.physics.world.enable(this);
    this.setScale(2, 2);
    this.setBodySize(22, 22);

    //Create all the animations, running, walking attacking, in all directions of movement
    createMonsterAnimations(this);

    this.stateMachine = new StateMachine(this, "monsterStateMachine")
      .addState("idle", {
        onUpdate: this.idleUpdate
      })
      .addState("hit", {
        onEnter: this.hitEnter
      })
      .addState("walk", {
        onUpdate: this.walkUpdate
      })
      .addState("attack", {
        onEnter: this.attackEnter
      });

    this.stateMachine.setState("idle");

  }

  update(time, delta) {
    this.checkAggroZone(); //check if a player is in my aggro zone
    this.aggroZone.shadowOwner(); //makes the zone follow the monster it's tied to

    if(this.stateMachine.currentStateName !== "hit" && this.stateMachine.currentStateName !== "attack") {
      if (this.waypoints.length) {
        if (this.waypointIdx === 0) {
          this.stateMachine.setState("walk");
          this.waypointIdx = 0;
          this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
        }
        this.updatePathMovement();
      }
    }
    this.stateMachine.update(time, delta);
  }

  updatePathMovement() {
    if (this.nextWaypoint) {
      const nextMapVertex = mapToScreen(this.nextWaypoint.x, this.nextWaypoint.y);
      this.dx = Math.floor(nextMapVertex.x - this.x);
      this.dy = Math.floor(nextMapVertex.y - this.y);

      if (Math.abs(this.dx) < 5) {
        this.dx = 0;
      }
      if (Math.abs(this.dy) < 5) {
        this.dy = 0;
      }
      // console.log(`dx: ${this.dx}, dy ${this.dy} -- ${this.x}, ${this.y} to ${nextMapVertex.x}, ${nextMapVertex.y} `);
      this.getMovementDirection(this.dx, this.dy);
      //reached the waypoint, get the next waypoint
      if (this.dx === 0 && this.dy === 0) {
        if (this.waypoints.length > 0) {
          this.previousWaypoint = this.nextWaypoint;
          let nextWaypoint = this.waypoints[this.waypointIdx];
          // console.log("next waypoint", nextWaypoint);
          if (nextWaypoint) {
            this.waypointIdx++;
            this.setNextWaypoint(nextWaypoint);
          } else {
            this.vdx = 0;
            this.vdy = 0;
            this.clearPath();
            this.nextWaypoint = undefined;
          }
        }
      }
    }
  }

  setNextWaypoint(node) {
    this.nextWaypoint = node;
  }

  getMovementDirection(dx, dy) {
    const east = dx > 0;
    const west = dx < 0;
    const north = dy < 0;
    const south = dy > 0;
    let vdy = 0;
    let vdx = 0;
    let direction = this.direction;

    if (west) {
      vdx = -1;
      direction = WEST;
    } else if (east) {
      vdx = 1;
      direction = EAST;
    } else if (north) {
      direction = NORTH;
      vdy = -1;
    } else if (south) {
      direction = SOUTH;
      vdy = 1;
    }

    // if (north) {
    //   vdy = -1;
    // } else if (south) {
    //   vdy = 1;
    // } else {
    //   vdy = 0;
    // }
    // if (east) {
    //   vdx = 1;
    //   if (vdy === 0) {
    //     direction = EAST;
    //   } else if (vdy === 1) {
    //     direction = SOUTHEAST;
    //     vdx = 1;
    //     vdy = 1;
    //   } else {
    //     direction = NORTHEAST;
    //     vdx = 1;
    //     vdy = -1;
    //   }
    // } else if (west) {
    //   vdx = -1;
    //   if (vdy === 0) {
    //     direction = WEST;
    //   } else if (vdy === 1) {
    //     direction = SOUTHWEST;
    //     vdy = 1;
    //     vdx = -1;
    //   } else {
    //     direction = NORTHWEST;
    //     vdx = -1;
    //     vdy = -1;
    //   }
    // } else {
    //   vdx = 0;
    //   if (vdy === 0) {
    //   } else if (vdy === 1) {
    //     direction = SOUTH;
    //   } else {
    //     direction = NORTH;
    //   }
    // }
    this.vdx = vdx;
    this.vdy = vdy;
    this.directionChanged = direction !== this.direction;
    this.direction = direction;
    if (this.directionChanged) {
      console.log(`direction changed from ${direction} to ${this.direction}`);
    }
  }
  flash(animation, frame) {
    if (frame.index === 3) {
      this.scene.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 200,
        onUpdate: (tween) => {
          const tweenVal = tween.getValue();
          if (tweenVal % 2) {
            this.setTintFill(0xffffff);
          } else {
            this.clearTint();
          }
        }
      });
    }
  }

  hitEnter() {
    this.animationPlayer("hit");

    let convertedDir = DIRECTION_CONVERSION[this.direction];
    const flash = (animation, frame) => {
      if (frame.index === 3) {
        this.scene.tweens.addCounter({
          from: 0,
          to: 100,
          duration: 200,
          onUpdate: (tween) => {
            const tweenVal = tween.getValue();
            if (tweenVal % 2) {
              this.setTintFill(0xffffff);
            } else {
              this.clearTint();
            }
          }
        });
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, flash);
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `${this.name}-hit-` + convertedDir,
      () => {
        this.clearTint();
        this.off(Phaser.Animations.Events.ANIMATION_UPDATE, flash);
        this.stateMachine.setState(this.stateMachine.previousStateName);
      }
    );
  }


  attackEnter() {
    this.animationPlayer("attack");
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `${this.name}-attack-` + convertedDir,
      () => {
        this.stateMachine.setState("idle");
      }
    );
  }

  walkUpdate() {
    this.animationPlayer("walk");
  }

  idleUpdate() {
    this.animationPlayer("idle");
  }

  //plays the correct animation based on the state
  animationPlayer(state) {
    const currentAnimationPlaying = this.anims.getName();
    const convertedDir = DIRECTION_CONVERSION[this.direction];
    const animationToPlay = `${this.name}-${state}-${convertedDir}`;
    if (!this.anims.isPlaying || animationToPlay !== currentAnimationPlaying) {
      //if a different animation is playing, then lets change
      this.anims.play(animationToPlay);
    }
    if(this.stateMachine.currentStateName === "melee" || this.stateMachine.currentStateName === "hit") {
      this.vdx = 0;
      this.vdy = 0;
    }
    this.setVelocityX(this.speeds.walk * this.vdx);
    this.setVelocityY(this.speeds.walk * this.vdy);
  }

  checkAggroZone() {
    if (this.aggroZone.hasTarget()) {
      const zoneStatus = this.aggroZone.checkZone();
      if (zoneStatus.isTargetInZone) {
        if (zoneStatus.targetHasMoved) {
          this.clearPath();
          this.getPathTo(zoneStatus.targetX, zoneStatus.targetY).then((path) => {
            this.waypoints = path.slice(1);
          });
        } else if (zoneStatus.isNextToTarget) {
          this.clearPath();
          this.stateMachine.setState('attack');
        }
      } else {
        this.clearPath();
        this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
          this.waypoints = path.slice(1);
        });
      }
    }
  }

  clearPath() {
    window.clearInterval(this.pathIntervalId);
    this.pathIntervalId = undefined;
    this.pathId = undefined;
    this.waypoints = [];
    this.waypointIdx = 0;
    this.vdx = 0;
    this.vdy = 0;
    this.dx = 0;
    this.dy = 0;
    this.nextWaypoint = undefined;
    this.previousWaypoint = undefined;
    // this.stateMachine.setState('idle');
  }

  getPathTo(x, y) {
    return new Promise((resolve, reject) => {
      const startNode = screenToMap(this.x, this.y);
      this.scene.pathfinder.cancelPath(this.pathId);
      // console.log(`Pathing from ${startNode.x},${startNode.y} to ${x},${y}`);
      this.pathId = this.scene.pathfinder.findPath(startNode.x, startNode.y, x, y, (path) => {
        // console.log(path);
        resolve(path);
      });
      this.scene.pathfinder.calculate();
    });
  }

  teleportTo(x, y) {
    this.x = x;
    this.y = y;
  }

  moveTo(x, y) {
    const chaseAlongPath = (path) => {
      if (path === null) {
        this.clearPath();
        return;
      }
      path = path.slice(1, path.length - 1);
      // this.waypoints = path;
      let pathIndex = 0;
      this.pathIntervalId = window.setInterval(() => {
        if (path[pathIndex]) {
          this.x = path[pathIndex].x * 16;
          this.y = path[pathIndex].y * 16;
          pathIndex++;
        } else {
          this.clearPath();
        }
      }, 300);
    };
    const startNode = screenToMap(this.x, this.y);
    const boundCallback = chaseAlongPath.bind(this);
    this.scene.pathfinder.cancelPath(this.pathId);
    window.clearInterval(this.pathIntervalId);
    this.pathId = this.scene.pathfinder.findPath(startNode.x, startNode.y, x, y, boundCallback);
    this.scene.pathfinder.calculate();
  }
}
