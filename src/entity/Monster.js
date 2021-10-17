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
import StateMachine from "../StateMachine";
import { screenToMap } from "../util/conversion";
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
   * @param {number} id the NPC id
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
      walk: 100,
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

    //Monster Aggro Zone
    this.aggroZone = new AggroZone(this.scene, this.x, this.y, 100, 100, this);

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
    this.stateMachine.update(time, delta);
    this.checkAggroZone(); //check if a player is in my aggro zone
    this.aggroZone.shadowOwner(); //makes the zone follow the monster it's tied to

    if (this.waypoints.length) {
      let moveData = this.updatePathMovement();
      if (moveData !== undefined) {
        this.pathMovement(moveData.dx, moveData.dy, moveData.vdX, moveData.vdY, moveData.direction);
      } else {
        this.pathMovement();
      }
    }
  }

  updatePathMovement() {
    if (this.nextWaypoint) {
      this.dx = this.nextWaypoint.x - this.x;
      this.dy = this.nextWaypoint.y - this.y;

      if (Math.abs(this.dx) < 15) {
        this.dx = 0;
      }
      if (Math.abs(this.dy) < 15) {
        this.dy = 0;
      }
      this.getMovementDirection(this.previousWaypoint, this.nextWaypoint);

      //reached the waypoint, get the next waypoint
      if (this.dx === 0 && this.dy === 0) {
        if (this.path.length > 0) {
          this.previousWaypoint = this.nextWaypoint;
          let nextWaypoint = this.path[this.pathIdx++];
          if (nextWaypoint) {
            this.setNextWaypoint(nextWaypoint);
          } else {
            this.vdX = 0;
            this.vdY = 0;
            this.nextWaypoint = undefined;
          }
        }
      }
    }
  }

  setNextWaypoint(node) {
    this.nextWaypoint = node;
  }

  getMovementDirection(start, end) {
    let dx = end.x - start.x;
    let dy = end.y - start.y;

    const east = dx > 0;
    const west = dx < 0;
    const north = dy < 0;
    const south = dy > 0;

    let vdX = 0;
    let vdY = 0;
    let direction = this.direction;

    if (north) {
      vdY = -1;
    } else if (south) {
      vdY = 1;
    } else {
      vdY = 0;
    }
    if (east) {
      vdX = 1;
      if (vdY === 0) {
        direction = EAST;
      } else if (vdY === 1) {
        direction = SOUTHEAST;
        vdX = 1;
        vdY = 1;
      } else {
        direction = NORTHEAST;
        vdX = 1;
        vdY = -1;
      }
    } else if (west) {
      vdX = -1;
      if (vdY === 0) {
        direction = WEST;
      } else if (vdY === 1) {
        direction = SOUTHWEST;
        vdY = 0.5;
        vdX = -1;
      } else {
        direction = NORTHWEST;
        vdX = -1;
        vdY = -0.5;
      }
    } else {
      vdX = 0;
      if (vdY === 0) {
      } else if (vdY === 1) {
        direction = SOUTH;
      } else {
        direction = NORTH;
      }
    }
    this.vdX = vdX;
    this.vdY = vdY;
    this.directionChanged = direction !== this.direction;
    this.direction = direction;
    if (this.directionChanged) {
      console.log(`direction changed from ${direction} to ${this.direction}`);
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
        this.stateMachine.setState("idle");
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
    let vdx = 0;
    let vdy = 0;
    let direction = this.direction;
    //get movement data based on player inputs

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
      console.log("playing animation", animationToPlay);
      this.anims.play(animationToPlay);
    }
    this.setVelocityX(
      this.speeds.walk * (this.stateMachine.currentStateName === "melee" ? 0 : vdx)
    );
    this.setVelocityY(
      this.speeds.walk * (this.stateMachine.currentStateName === "melee" ? 0 : vdy)
    );
  }

  checkAggroZone(zoneStatus) {
    if (this.aggroZone.hasTarget()) {
      const zoneStatus = this.aggroZone.checkZone();
      if (zoneStatus.isTargetInZone) {
        if (zoneStatus.targetHasMoved) {
          this.moveTo(zoneStatus.targetX, zoneStatus.targetY);
        } else if (zoneStatus.isNextToTarget) {
          this.path = [];
        }
      } else {
        this.moveTo(this.spawnPoint.x, this.spawnPoint.y);
      }
    }
  }

  clearPath() {
    window.clearInterval(this.pathIntervalId);
    this.pathIntervalId = undefined;
    this.pathId = undefined;
    this.path = [];
    this.pathIdx = 0;
  }

  moveTo(x, y) {
    const chaseAlongPath = (path) => {
      if (path === null) {
        return;
      }
      path = path.slice(1, path.length - 1);
      this.path = path;
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
