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
import { MONSTER_STATES, MonsterStates } from "./MonsterStates";

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
      walk: 80,
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
    this.stateMachine = new StateMachine(this, "monsterStateMachine", true)
      .addState(MONSTER_STATES.NEUTRAL, {
        onUpdate: this.monsterStates.neutralUpdate
      })
      .addState(MONSTER_STATES.CONTROLLING, {})
      .addState(MONSTER_STATES.CONTROLLED, {})
      .addState(MONSTER_STATES.CONTROLLING_WALK, {
        onUpdate: this.monsterStates.controlledWalkUpdate
      })
      .addState(MONSTER_STATES.CONTROLLING_ATTACK, {})
      .addState(MONSTER_STATES.CONTROLLING_IDLE, {})
      .addState(MONSTER_STATES.CONTROLLING_HIT, {})
      .addState(MONSTER_STATES.CONTROLLED_WALK, {})
      .addState(MONSTER_STATES.CONTROLLED_ATTACK, {})
      .addState(MONSTER_STATES.CONTROLLED_IDLE, {})
      .addState(MONSTER_STATES.CONTROLLED_HIT, {});

    /*************************
     * Multiplayer Variables *
     *************************/
    //When being controlled
    this.remoteSnapshots = []; //where we store state snapshots sent from the server to control this character
    this.nextRemoteSnapshot = null; //the next snapshot to play
    this.remoteSnapshotStartTime = null; //the start time of the currently playing snapshot

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
    this.stateMachine.setState(MONSTER_STATES.NEUTRAL);
  }

  update(time, delta) {
    this.aggroZone.shadowOwner(); //makes the zone follow the monster it's tied to
    if (
      this.stateMachine.isCurrentState(MONSTER_STATES.NEUTRAL) ||
      this.stateMachine.stateStartsWidth(MONSTER_STATES.CONTROLLING)
    ) {
      this.checkAggroZone(); //check if a player is in my aggro zone
      this.updatePathMovement();
      // if (this.pathHasChanged) {
      //   //transmit new path
      //   this.pathHasChanged = false;
      //   console.log("transmitted");
      //   eventEmitter.emit("monsterControlBroadcastDirections", {
      //     action: "controlPathing",
      //     monsterId: this.id,
      //     waypoints: this.waypoints
      //   });
      // }
      //we're sending pathing data, and other state change data here
    } else if (this.stateMachine.currentStateName.startsWith("CONTROLLED")) {
      //we're receiving and playing back the pathing and state data here
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
    return { dx, dy, hasReachedWaypoint: !dx && !dy };
  }

  updatePathMovement() {
    if (this.nextWaypoint) {
      let { dx, dy, hasReachedWaypoint } = this.hasReachedWaypoint(this.nextWaypoint);
      this.getMovementDirection(dx, dy);
      if (hasReachedWaypoint) {
        //is there a next waypoint?
        if (this.waypoints.length >= 1) {
          //set the next waypoint and recalculate
          // this.setNextWaypoint(this.waypoints.shift());
          this.setNextWaypoint();
        }
      }
    }
  }

  setNextWaypoint() {
    //am i standing on this tile already? if so, go to the following tile
    const currentTile = screenToMap(this.x, this.y);
    const proposedWaypoint = this.waypoints.shift() ;
    if(this.waypoints.length) {
      if (currentTile.x === proposedWaypoint.x && currentTile.y === proposedWaypoint.y) {
        this.nextWaypoint = this.waypoints.shift();
      }
      else {
        this.nextWaypoint = proposedWaypoint;
      }
    }
    else {
      this.nextWaypoint = proposedWaypoint;
    }

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
    // if (!vdx && !vdy) {
    //   console.log("reseting vdx and vdy in getMovementDirection");
    // }
    this.vdx = vdx;
    this.vdy = vdy;
    this.directionChanged = direction !== this.direction;
    if (this.directionChanged) {
      // console.log(`direction changed from ${direction} to ${this.direction}`);
    }
    this.direction = direction;
  }

  //plays the correct animation based on the state
  animationPlayer(state) {
    if (!this.anims) return;
    const currentAnimationPlaying = this.anims.getName();
    let vdx = 0;
    let vdy = 0;
    let direction = this.direction;
    //get movement data based on the state snapshots
    if (this.nextRemoteSnapshot) {
      vdx = this.nextRemoteSnapshot.vdx;
      vdy = this.nextRemoteSnapshot.vdy;
      direction = this.getDirectionFromVelocity(vdx, vdy);
    }
    this.direction = direction;
    const convertedDir = DIRECTION_CONVERSION[this.direction];
    const animationToPlay = `${this.templateName}-${state}-${convertedDir}`;
    if (!this.anims.isPlaying || animationToPlay !== currentAnimationPlaying) {
      this.anims.play(animationToPlay);
    }
    if (
      this.stateMachine.currentStateName === "attack" ||
      this.stateMachine.currentStateName === "hit"
    ) {
      console.log("attacking or getting hit");
      this.vdx = 0;
      this.vdy = 0;
    }
    // console.log(this.vdx, this.vdy);
    this.setVelocityX(this.speeds.walk * this.vdx);
    this.setVelocityY(this.speeds.walk * this.vdy);
  }

  pathToCallback(path) {
    this.stateMachine.setState(MONSTER_STATES.CONTROLLING_WALK);
    let mergedPath = [];
    if (this.waypoints.length) {
      for (let i = 0; i < this.waypoints.length; i++) {
        const currentWaypoint = this.waypoints[i];
        const newWaypoint = path[i];
        if(this.nextWaypoint) {
          if (currentWaypoint.x === newWaypoint.x && currentWaypoint.y === newWaypoint.y) {
            mergedPath.push(currentWaypoint);
          }
          else {
            mergedPath.push(...path.slice(i));
            break;
          }
        }
        else {
          break;
        }
      }
    }


    if (mergedPath.length) {
      this.waypoints = mergedPath;
      console.log("[MERGED PATH]", mergedPath.slice());
      this.setNextWaypoint();
      console.log('First waypoint', this.nextWaypoint, 'standing at', screenToMap(this.x, this.y));
    }
    else {
      this.waypoints = path.slice(1);
      console.log("[NEW PATH]", this.waypoints.slice());
      if (this.waypoints.length) {
        // this.setNextWaypoint(this.waypoints.shift());
        this.setNextWaypoint();
        console.log('First waypoint', this.nextWaypoint, 'standing at', screenToMap(this.x, this.y));
      }
    }

    this.pathHasChanged = true;
  }

  checkAggroZone() {
    if (this.receivedAggroResetRequest) {
      console.log("aggro reset request");
      this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
        this.pathToCallback(path);
      });
      this.receivedAggroResetRequest = false;
      this.controlState = MONSTER_STATES.NEUTRAL;
    } else if (this.aggroZone.hasTarget()) {
      const zoneStatus = this.aggroZone.checkZone();
      if (zoneStatus.isTargetInZone) {
        if (zoneStatus.targetHasMoved && !zoneStatus.isNextToTarget) {
          // const startNode = screenToMap(this.x, this.y);
          // console.log(
          //   `PRECALCULATE: ${startNode.x}, ${startNode.y} to ${zoneStatus.targetX}, ${zoneStatus.targetY}`
          // );
          this.getPathTo(zoneStatus.targetX, zoneStatus.targetY).then((path) => {
            this.pathToCallback(path);
          });
        } else if (zoneStatus.isNextToTarget) {
          // this.stateMachine.setState("attack");
          // console.log("attack");
        }
      } else {
        console.log("reset aggro");
        this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
          this.pathToCallback(path);
        });
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
      console.log(`CALCULATE: ${startNode.x}, ${startNode.y} to ${x}, ${y}`);
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

  setNextRemoteSnapshot(stateSnapshot) {
    this.nextRemoteSnapshot = stateSnapshot;
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
        state = this.nextRemoteSnapshot.state;
      }
      //switch to next stateSnapshot upon completion of this one
      if (time - this.remoteSnapshotStartTime >= this.nextRemoteSnapshot.duration) {
        this.moveToCoordinate(this.nextRemoteSnapshot.endX, this.nextRemoteSnapshot.endY);
        this.setNextRemoteSnapshot(this.remoteSnapshots.shift());
        this.remoteSnapshotStartTime = null;
      }
    }
    this.stateMachine.setState(state);
  }

  //saves snapshots of the controlling monsters state, which will be transmitted to the server later on
  saveStateSnapshots(time, delta) {
    const lastSnapshot = this.localStateSnapshots[this.localStateSnapshots.length - 1];
    let newVdx = this.vdx;
    let newVdy = this.vdy;
    let newDirection = this.direction;
    let newState = this.stateMachine.currentStateName;
    //if something about this characters movement has changed then we should start a new snapshot
    if (
      newVdx !== this.lastVdx ||
      newVdy !== this.lastVdy ||
      newDirection !== this.lastDirection ||
      (this.localStateSnapshots.length === 0 && newState !== "idle" && !this.instant)
    ) {
      if (newState === "attack") {
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
        action: "monsterControllerChangedState",
        data: {
          monsterId: this.id,
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
}
