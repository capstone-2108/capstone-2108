import {
  DIRECTION_CONVERSION,
  EAST,
  NORTH,
  NORTHWEST,
  SNAPSHOT_REPORT_INTERVAL,
  SOUTH,
  SOUTHEAST,
  SOUTHWEST,
  WEST
} from "../constants/constants";
import StateMachine from "../StateMachine";
import { mapToScreen, screenToMap } from "../util/conversion";
import { AggroZone } from "./AggroZone";
import { createMonsterAnimations } from "../animation/createAnimations";
import { eventEmitter } from "../event/EventEmitter";
import {MONSTER_CONTROL_STATES, MONSTER_STATES, MonsterStates} from './MonsterStates';

export class Monster extends Phaser.Physics.Arcade.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} spriteKey
   * @param {string} templateName
   * @param {number} id the monster id
   */
  constructor(scene, x, y, spriteKey, templateName, id) {
    super(scene, x, y, spriteKey);
    this.x = x;
    this.y = y;
    this.spriteKey = spriteKey;
    this.scene = scene;
    this.templateName = templateName; //the name of this character
    this.scene.add.existing(this); //adds this sprite to the scene
    this.setInteractive();
    this.speeds = {
      walk: 120,
      run: 150
    };
    this.direction = SOUTH; //the direction the character is facing or moving towards
    this.movementMode = "walk"; //the current movement mode, walk or run
    this.id = id; //the characterId of this player

    //the original position of the monster
    this.spawnPoint = screenToMap(this.x, this.y);

    //Pathfinding
    this.pathId = undefined; //an integer identifier for the last path generated
    this.waypoints = []; //waypoints of the current path
    this.waypointIdx = 0; //index of the current path node
    this.nextWaypoint = undefined; //the next waypoint to travel to
    this.pathHasChanged = false;

    this.vdx = 0; //modifies X velocity (negative: west, positive: east, 0: not moving)
    this.vdy = 0; //modifies Y velocity (negative: north, positive: south, 0: not moving)
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

    //State
    this.monsterStates = new MonsterStates(this.scene, this);
    this.controlStateMachine = new StateMachine('monsterControlStateMachine', true)
      .addState(MONSTER_CONTROL_STATES.NEUTRAL, {})
      .addState(MONSTER_CONTROL_STATES.CONTROLLING, {})
      .addState(MONSTER_CONTROL_STATES.CONTROLLED, {})

    this.stateMachine = new StateMachine(this, "monsterStateMachine", true)
      .addState(MONSTER_STATES.WALK, {
        onUpdate: this.monsterStates.walkUpdate
      })
      .addState(MONSTER_STATES.ATTACK, {
        onEnter: this.monsterStates.attackEnter
      })
      .addState(MONSTER_STATES.IDLE, {
        onUpdate: this.monsterStates.idleUpdate
      })
      .addState(MONSTER_STATES.HIT, {
        onEnter: this.monsterStates.hitEnter
      })


    /*************************
     * Multiplayer Variables *
     *************************/
    //When being controlled
    this.remoteSnapshots = []; //where we store state snapshots sent from the server to control this character
    this.nextRemoteSnapshot = null; //the next snapshot to play
    this.remoteSnapshotStartTime = null; //the start time of the currently playing snapshot
    this.animationPlaying = false;

    /**this array stores snapshots of the monsters movements so that we can let everyone else know about the later on**/
    this.localStateSnapshots = []; //this is where we hold snapshots of state before they are transmitted to the server
    this.snapShotsLen = 0;
    this.lastReportTime = 0;
    //the next 4 variables are used to determine if anything about a players movements have changed
    //we compare the last value against the current value to determine this
    this.lastVdx = 0;
    this.lastVdy = 0;
    this.lastDirection = this.direction;
    this.lastMode = this.mode;
    this.receivedAggroResetRequest = false;
    this.controlStateMachine.setState(MONSTER_CONTROL_STATES.NEUTRAL);
    this.stateMachine.setState(MONSTER_STATES.IDLE);

    this.body.offset.x = 13;
    this.body.offset.y = 13;
  }

  update(time, delta) {
    if(this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLED)) {
    }
    this.aggroZone.shadowOwner(); //makes the zone follow the monster it's tied to
    if(this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.NEUTRAL) ||
      this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLING)) {
      this.checkAggroZone(); //check if a player is in my aggro zone
      if (this.waypoints.length) {
        if (this.waypointIdx === 0) {
          this.stateMachine.setState(MONSTER_STATES.WALK);
          this.waypointIdx = 0;
          this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
        }
      }
      this.updatePathMovement();
      if (this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLING)) {
        this.saveStateSnapshots(time, delta);
      }
    } else if (this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLED)) {
      this.playRemoteSnapshots(time, delta);
    }
    this.stateMachine.update(time, delta);
  }

  hasReachedWaypoint(waypoint) {
    const nextMapVertex = mapToScreen(waypoint.x, waypoint.y);
    let dx = Math.floor(nextMapVertex.x - this.x);
    let dy = Math.floor(nextMapVertex.y - this.y);
    if (Math.abs(dx) < 5) {
      dx = 0;
    }
    if (Math.abs(dy) < 5) {
      dy = 0;
    }
    return { dx, dy, hasReachedWaypoint: dx === 0 && dy === 0 };
  }

  updatePathMovement() {
    if (this.nextWaypoint) {
      let { dx, dy, hasReachedWaypoint } = this.hasReachedWaypoint(this.nextWaypoint);
      this.getMovementDirection(dx, dy);
      // reached the waypoint, get the next waypoint
      if (hasReachedWaypoint) {
        if (this.waypoints.length > 0) {
          let nextWaypoint = this.waypoints[this.waypointIdx++];
          if (nextWaypoint) {
            this.setNextWaypoint(nextWaypoint);
          } else {
            this.clearPath();
          }
        }
      }
    }
  }
  setNextWaypoint(node) {
    this.nextWaypoint = node;
  }

  getDirectionFromVelocity(vdx, vdy) {
    let direction = this.direction;

    if (vdx === -1) {
      direction = WEST;
    } else if (vdx === 1) {
      direction = EAST;
    } else if (vdy === -1) {
      direction = NORTH;
    } else if (vdx === 1) {
      direction = SOUTH;
    }
    return direction;
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
    this.vdx = vdx;
    this.vdy = vdy;
    this.directionChanged = direction !== this.direction;
    // if (this.directionChanged) {
      // console.log(`direction changed from ${direction} to ${this.direction}`);
    // }
    this.direction = direction;
  }

  //plays the correct animation based on the state
  animationPlayer(state) {
    if (!this.anims) return;
    const currentAnimationPlaying = this.anims.getName();
    const convertedDir = DIRECTION_CONVERSION[this.direction];
    const animationToPlay = `${this.templateName}-${state}-${convertedDir}`;
    if (!this.anims.isPlaying || animationToPlay !== currentAnimationPlaying) {
      this.anims.play(animationToPlay);
    }
    if (this.stateMachine.isCurrentState(MONSTER_STATES.ATTACK)) {
      this.vdx = 0;
      this.vdy = 0;
    }
    this.setVelocityX(this.speeds.walk * this.vdx);
    this.setVelocityY(this.speeds.walk * this.vdy);
  }


  checkAggroZone() {
    if (this.receivedAggroResetRequest) {
      // console.log("aggro reset request");
      this.clearPath();
      this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
        this.waypoints = path.slice(1);
      });
      this.receivedAggroResetRequest = false;
      this.controlStateMachine.setState(MONSTER_CONTROL_STATES.NEUTRAL);
    } else if (this.aggroZone.hasTarget()) {
      const zoneStatus = this.aggroZone.checkZone();
      if (zoneStatus.isTargetInZone) {
        if (zoneStatus.targetHasMoved && !zoneStatus.isNextToTarget) {
          this.clearPath();
          this.getPathTo(zoneStatus.targetX, zoneStatus.targetY).then((path) => {
            this.stateMachine.setState(MONSTER_STATES.WALK);
            this.waypointIdx = 0;
            this.waypoints = path.slice(1);
            this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
          });
        } else if (zoneStatus.isNextToTarget) {
          this.clearPath();
          // if(!this.stateMachine.isCurrentState(MONSTER_STATES.HIT)) {
          //   this.stateMachine.setState(MONSTER_STATES.ATTACK);
          // }
        }
      } else {
        this.clearPath();
          this.stateMachine.setState(MONSTER_STATES.IDLE);
        // this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
        //   this.stateMachine.setState(MONSTER_STATES.WALK);
        //   this.waypointIdx = 0;
        //   this.waypoints = path.slice(1);
        //   this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
        // });
      }
    }
  }

  clearPath() {
    console.log("clearPath");
    this.pathId = undefined;
    this.waypoints = [];
    this.vdx = 0;
    this.vdy = 0;
    this.dx = 0;
    this.dy = 0;
    this.nextWaypoint = undefined;
    // this.stateMachine.setState('idle');
  }

  getPathTo(x, y) {
    return new Promise((resolve, reject) => {
      const startNode = screenToMap(this.x, this.y);
      this.scene.pathfinder.cancelPath(this.pathId);
      // console.log(`CALCULATE: ${startNode.x}, ${startNode.y} to ${x}, ${y}`);
      this.pathId = this.scene.pathfinder.findPath(startNode.x, startNode.y, x, y, (path) => {
        resolve(path);
      });
      this.scene.pathfinder.calculate();
    });
  }

  moveToCoordinate(x, y) {
    this.x = x;
    this.y = y;
  }



  playRemoteSnapshots(time, delta) {
    let state = this.stateMachine.currentStateName;
    if (this.remoteSnapshots.length && !this.nextRemoteSnapshot) {
      this.setNextRemoteSnapshot(this.remoteSnapshots.shift());
      this.remoteSnapshotStartTime = null;
    }
    if (this.nextRemoteSnapshot) {
      if (!this.remoteSnapshotStartTime) {
        this.remoteSnapshotStartTime = time;
      }

      if(time - this.remoteSnapshotStartTime >= this.nextRemoteSnapshot.duration) {
        this.setNextRemoteSnapshot(time);
      }
    }
    else {

    }
    // this.stateMachine.setState(state);
  }

  setNextRemoteSnapshot(time) {
    if(this.nextRemoteSnapshot) {
      this.moveToCoordinate(this.nextRemoteSnapshot.endX, this.nextRemoteSnapshot.endY);
    }
    const nextSnapshot = this.remoteSnapshots.shift();
    if(nextSnapshot) {
      this.vdx = nextSnapshot.vdx;
      this.vdy = nextSnapshot.vdy;
      this.stateMachine.setState(nextSnapshot.state);
      this.direction = nextSnapshot.direction;
      if(nextSnapshot.duration === -1) {
        this.animationPlaying = true;
      }
      this.remoteSnapshotStartTime = time;
      this.nextRemoteSnapshot = nextSnapshot;
    }

  }

  //saves snapshots of the controlling monsters state, which will be transmitted to the server later on
  saveStateSnapshots(time, delta) {
    const lastSnapshot = this.localStateSnapshots[this.localStateSnapshots.length - 1];
    let newVdx = this.vdx;
    let newVdy = this.vdy;
    let newDirection = this.direction;
    let newState = this.stateMachine.currentStateName;
    //if something about this characters movement has changed then we should start a new snapshot

    if (newVdx !== this.lastVdx || newVdy !== this.lastVdy || newDirection !== this.lastDirection ||
      (this.localStateSnapshots.length === 0 && newState !== this.lastState)) {
      if (lastSnapshot && !lastSnapshot.duration) {
        lastSnapshot.duration = time - lastSnapshot.timeStarted;
        delete lastSnapshot.timeStarted;
        lastSnapshot.endX = Math.floor(this.x);
        lastSnapshot.endY = Math.floor(this.y);
      }
      // if (newState !== MONSTER_STATES.IDLE) {
        console.log('creating snapshots');
        this.localStateSnapshots[this.snapShotsLen++] = {
          vdx: newVdx,
          vdy: newVdy,
          endX: undefined,
          endY: undefined,
          timeStarted: time,
          state: newState === "" ? MONSTER_STATES.IDLE : newState,
          direction: this.direction,
          duration: undefined
        };
      // }
      this.lastVdx = newVdx;
      this.lastVdy = newVdy;
      this.lastDirection = newDirection;
      this.lasState = newState;
    } else if (time - this.lastReportTime > SNAPSHOT_REPORT_INTERVAL && this.localStateSnapshots.length > 0) {
      //we send all the snapshots we've taken every given interval, providing there are any
      if (lastSnapshot && lastSnapshot.duration === undefined) {
        lastSnapshot.duration = time - lastSnapshot.timeStarted;
      }
      delete lastSnapshot.timeStarted;
      lastSnapshot.endX = Math.floor(this.x);
      lastSnapshot.endY = Math.floor(this.y);
      console.log('emitting', this.localStateSnapshots);
      eventEmitter.emit("monsterControlDirections", {
        monsterId: this.id,
        stateSnapshots: this.localStateSnapshots
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
}
