import {
  DIRECTION_CONVERSION,
  EAST,
  MONSTER_SNAPSHOT_REPORT_INTERVAL,
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
import { MONSTER_CONTROL_STATES, MONSTER_STATES, MonsterStates } from "./MonsterStates";
import { damageFlash } from "../animation/tweens";

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
  constructor(scene, x, y, spriteKey, templateName, id, isAlive = true) {
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
    this.spawnPoint = screenToMap(this.x, this.y, this.scene.tileSize);

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

    /*************************
     * Attack *
     *************************/
    this.meleeHitbox = this.scene.add.rectangle(this.x - 60, this.y - 60, 32, 64, 0xffffff, 0);
    this.scene.physics.add.existing(this.meleeHitbox);
    this.meleeHitbox.body.enable = false;
    this.scene.physics.world.remove(this.meleeHitbox.body);
    // this.scene.physics.add.overlap(this.meleeHitbox, this.scene.player, (hitbox, player) => {
    //   if (player instanceof LocalPlayer) {
    //     player.stateMachine.setState("hit");
    //
    //     // if (!player.stateMachine.stateLock) {
    //     //   eventEmitter.emit("localPlayerHitMonster", {
    //     //     playerCharacterId: this.id,
    //     //     monsterId: monster.id,
    //     //     damage: 10
    //     //   });
    //     // }
    //    // player.stateMachine.stateLock = true;
    //   } else {
    //     //hitRemote
    //   }
    // });

    //State
    this.monsterStates = new MonsterStates(this.scene, this);
    this.controlStateMachine = new StateMachine(this, "monsterControlStateMachine")
      .addState(MONSTER_CONTROL_STATES.NEUTRAL, {})
      .addState(MONSTER_CONTROL_STATES.CONTROLLING, {})
      .addState(MONSTER_CONTROL_STATES.CONTROLLED, {});

    this.stateMachine = new StateMachine(this, "monsterStateMachine" + this.id)
      .addState(MONSTER_STATES.WALK, {
        onEnter: this.monsterStates.walkEnter,
        onUpdate: this.monsterStates.walkUpdate,
        onExit: this.monsterStates.walkExit
      })
      .addState(MONSTER_STATES.ATTACK, {
        onEnter: this.monsterStates.attackEnter,
        onUpdate: this.monsterStates.attackUpdate,
        onExit: this.monsterStates.attackExit
      })
      .addState(MONSTER_STATES.IDLE, {
        onEnter: this.monsterStates.idleEnter,
        onUpdate: this.monsterStates.idleUpdate,
        onExit: this.monsterStates.idleExit
      })
      .addState(MONSTER_STATES.DEAD, {
        onEnter: this.monsterStates.deadEnter,
        onUpdate: this.monsterStates.deadUpdate,
        onExit: this.monsterStates.deadExit
      });

    /*************************
     * Multiplayer Variables *
     *************************/
    //When being controlled
    this.remoteSnapshots = []; //where we store state snapshots sent from the server to control this character
    this.nextRemoteSnapshot = null; //the next snapshot to play
    this.remoteSnapshotStartTime = null; //the start time of the currently playing snapshot
    this.animationPlaying = false;
    this.openSnapshot = undefined;

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

    this.body.offset.x = 13;
    this.body.offset.y = 13;

    if (!isAlive) {
      this.stateMachine.setState(MONSTER_STATES.DEAD);
    } else {
      this.stateMachine.setState(MONSTER_STATES.IDLE);
    }

    window.setInterval(() => {
      if (
        !this.stateMachine.isCurrentState(MONSTER_STATES.DEAD) &&
        this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLING)
      ) {
        eventEmitter.emit("updateMonsterDBPosition", {
          monsterId: this.id,
          xPos: Math.floor(this.x),
          yPos: Math.floor(this.y)
        });
      }
    }, 2000);
  }

  dealDamage() {
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    // this.stateLock = true;
    const applyHitBox = (animation, frame) => {
      if (frame.index < 3) return;
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
          this.meleeHitbox.y = this.y + 54;
          this.meleeHitbox.width = 64;
          this.meleeHitbox.height = 40;
          this.meleeHitbox.body.width = 64;
          this.meleeHitbox.body.height = 40;
          break;
        case EAST:
          this.meleeHitbox.x = this.x + 40;
          this.meleeHitbox.y = this.y;
          this.meleeHitbox.width = 40;
          this.meleeHitbox.height = 64;
          this.meleeHitbox.body.width = 40;
          this.meleeHitbox.body.height = 64;
          break;
        case WEST:
          this.meleeHitbox.x = this.x - 45;
          this.meleeHitbox.y = this.y;
          this.meleeHitbox.width = 40;
          this.meleeHitbox.height = 64;
          this.meleeHitbox.body.width = 40;
          this.meleeHitbox.body.height = 64;
          break;
      }
      this.scene.physics.overlap(this.meleeHitbox, this.scene.player, (hitBox, target) => {
        //plays damage animations on local player
        eventEmitter.emit("playerTookDamage", {
          monsterId: this.id,
          characterId: target.id,
          damage: 10
        });
        damageFlash(this.scene, target);
      });
      this.scene.physics.overlap(this.meleeHitbox, this.scene.playerGroup, (hitBox, target) => {
        //plays animations on remote players
        damageFlash(this.scene, target);
      });
      if (frame.index === 3) {
        this.meleeHitbox.body.enable = true;
        this.scene.physics.world.add(this.meleeHitbox.body);
      }
      if (frame.index === 4) {
        this.off(Phaser.Animations.Events.ANIMATION_UPDATE, applyHitBox);
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, applyHitBox);

    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        `${this.templateName}-attack-` +
        convertedDir,
      () => {
        this.meleeHitbox.body.enable = false;
        this.scene.physics.world.remove(this.meleeHitbox.body);
      }
    );
  }

  update(time, delta) {
    if (this.stateMachine.isCurrentState(MONSTER_STATES.DEAD)) {
      return;
    }
    this.aggroZone.shadowOwner(); //makes the zone follow the monster it's tied to
    if (
      this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.NEUTRAL) ||
      this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLING)
    ) {
      this.checkAggroZone(); //check if a player is in my aggro zone'
      if (this.waypoints.length) {
        if (this.waypointIdx === 0) {
          this.stateMachine.setState(MONSTER_STATES.WALK);
          this.waypointIdx = 0;
          this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
        }
      }
      this.updatePathMovement();
      if (this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLING)) {
        if (this.scene.time.now - this.lastReportTime > MONSTER_SNAPSHOT_REPORT_INTERVAL) {
          if (this.localStateSnapshots.length || this.openSnapshot) {
            if (this.openSnapshot) {
              this.closeSnapshot();
              this.createNewSnapshot(this.stateMachine.currentStateName);
            }
            eventEmitter.emit("monsterControlDirections", {
              monsterId: this.id,
              stateSnapshots: this.localStateSnapshots
            });
            this.localStateSnapshots = [];
            this.lastReportTime = time;
          }
        }
      }
    } else if (this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLED)) {
      this.playRemoteSnapshots(time, delta);
    } else if (
      this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.NEUTRAL) &&
      !this.waypoints.length
    ) {
      this.stateMachine.setState(MONSTER_STATES.IDLE);
    }
    this.stateMachine.update(time, delta);
  }

  hasReachedWaypoint(waypoint) {
    const nextMapVertex = mapToScreen(waypoint.x, waypoint.y, this.scene.tileSize);
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
      if (animationToPlay.includes("attack")) {
        this.scene.orcSE.play();
      }
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
      // this.clearPath();
      // this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
      //   this.waypoints = path.slice(1);
      // });
      this.receivedAggroResetRequest = false;
      this.controlStateMachine.setState(MONSTER_CONTROL_STATES.NEUTRAL);
      this.stateMachine.setState(MONSTER_STATES.IDLE);
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
          this.stateMachine.setState(MONSTER_STATES.ATTACK);
          if (zoneStatus.direction) {
            this.direction = zoneStatus.direction;
          }
        }
      } else {
        this.clearPath();
        // console.log('no target');
        this.stateMachine.setState(MONSTER_STATES.IDLE);
        // eventEmitter.emit('updateMonsterDBPosition', {
        //   monsterId: this.id,
        //   xPos: Math.floor(this.x),
        //   yPos: Math.floor(this.y)
        // })
        // this.getPathTo(this.spawnPoint.x, this.spawnPoint.y).then((path) => {
        //   this.stateMachine.setState(MONSTER_STATES.WALK);
        //   this.waypointIdx = 0;
        //   this.waypoints = path.slice(1);
        //   this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
        // });
      }
    }
  }

  pathTo(x, y) {
    const endNode = screenToMap(x, y, this.scene.tileSize);
    this.getPathTo(endNode.x, endNode.y).then((path) => {
      this.clearPath();
      this.stateMachine.setState(MONSTER_STATES.WALK);
      this.waypointIdx = 0;
      this.waypoints = path.slice(1);
      this.setNextWaypoint(this.waypoints[++this.waypointIdx]);
    });
  }

  clearPath() {
    // console.log("clearPath");
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
      // console.log('tileSize', this.scene.tileSize);
      const startNode = screenToMap(this.x, this.y, this.scene.tileSize);
      this.scene.pathfinder.cancelPath(this.pathId);
      // console.log(`CALCULATE: ${startNode.x}, ${startNode.y} to ${x}, ${y}`);
      this.pathId = this.scene.pathfinder.findPath(startNode.x, startNode.y, x, y, (path) => {
        // console.log("PATH", path);
        resolve(path);
      });
      this.scene.pathfinder.calculate();
    });
  }

  moveToCoordinate(x, y) {
    this.x = x;
    this.y = y;
  }

  // playRemoteSnapshots(time, delta) {
  //   let state = this.stateMachine.currentStateName;
  //   if (this.remoteSnapshots.length && !this.nextRemoteSnapshot) {
  //     this.setOtherPlayerNextStatesSnapshot(this.remoteSnapshots.shift());
  //   }
  //   if (this.nextRemoteSnapshot) {
  //     if (!this.stateSnapshotStartTime) {
  //       this.stateSnapshotStartTime = time;
  //       state = this.nextRemoteSnapshot.state;
  //     }
  //     //switch to next stateSnapshot upon completion of this one
  //     if (time - this.stateSnapshotStartTime >= this.nextRemoteSnapshot.duration) {
  //       this.moveToCoordinate(this.nextRemoteSnapshot.endX, this.nextRemoteSnapshot.endY);
  //       this.setOtherPlayerNextStatesSnapshot(this.remoteSnapshots.shift());
  //       this.stateSnapshotStartTime = null;
  //     }
  //   }
  //   this.stateMachine.setState(state);
  // }

  //for remote players, will set the next state stateSnapshot for movement / attacking
  // setOtherPlayerNextStatesSnapshot(stateSnapshot) {
  //   this.nextRemoteSnapshot = stateSnapshot;
  // }

  playRemoteSnapshots(time, delta) {
    let state = this.stateMachine.currentStateName;
    if (this.remoteSnapshots.length && !this.nextRemoteSnapshot) {
      this.setNextRemoteSnapshot(this.remoteSnapshots.shift());
      this.remoteSnapshotStartTime = null;
    }
    if (this.nextRemoteSnapshot) {
      // if (!this.remoteSnapshotStartTime) {
      //   this.remoteSnapshotStartTime = time;
      // }

      if (time - this.remoteSnapshotStartTime >= this.nextRemoteSnapshot.duration) {
        this.setNextRemoteSnapshot(time);
      }
    } else {
    }
    // this.stateMachine.setState(state);
  }

  setNextRemoteSnapshot(time) {
    if (this.nextRemoteSnapshot) {
      this.moveToCoordinate(this.nextRemoteSnapshot.endX, this.nextRemoteSnapshot.endY);
    }
    const nextSnapshot = this.remoteSnapshots.shift();
    if (nextSnapshot) {
      this.vdx = nextSnapshot.vdx;
      this.vdy = nextSnapshot.vdy;
      this.stateMachine.setState(nextSnapshot.state);
      this.direction = nextSnapshot.direction;
      if (nextSnapshot.duration === -1) {
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

    if (
      newVdx !== this.lastVdx ||
      newVdy !== this.lastVdy ||
      newDirection !== this.lastDirection ||
      (this.localStateSnapshots.length === 0 && newState !== this.lastState)
    ) {
      if (lastSnapshot && !lastSnapshot.duration) {
        lastSnapshot.duration = time - lastSnapshot.timeStarted;
        delete lastSnapshot.timeStarted;
        lastSnapshot.endX = Math.floor(this.x);
        lastSnapshot.endY = Math.floor(this.y);
      }
      // if (newState !== MONSTER_STATES.IDLE) {
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
    } else if (
      time - this.lastReportTime > MONSTER_SNAPSHOT_REPORT_INTERVAL &&
      this.localStateSnapshots.length > 0
    ) {
      //we send all the snapshots we've taken every given interval, providing there are any
      if (lastSnapshot && lastSnapshot.duration === undefined) {
        lastSnapshot.duration = time - lastSnapshot.timeStarted;
      }
      delete lastSnapshot.timeStarted;
      lastSnapshot.endX = Math.floor(this.x);
      lastSnapshot.endY = Math.floor(this.y);
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

  createNewSnapshot(state) {
    this.openSnapshot = {
      vdx: this.vdx,
      vdy: this.vdy,
      endX: undefined,
      endY: undefined,
      timeStarted: this.scene.time.now,
      state,
      direction: this.direction,
      duration: undefined
    };
  }

  updateSnapshot(time, state) {
    // if(!this.openSnapshot) {
    //   this.createNewSnapshot(state);
    // }
    if (!this.instant) {
      if (this.openSnapshot && this.direction !== this.openSnapshot.direction) {
        this.closeSnapshot();
        this.createNewSnapshot(state);
      }
    }

    // if(!this.localStateSnapshots.length) {
    //   this.createNewSnapshot(state);
    // }
  }

  closeSnapshot() {
    this.openSnapshot.endX = Math.floor(this.x);
    this.openSnapshot.endY = Math.floor(this.y);
    this.openSnapshot.duration = this.scene.time.now - this.openSnapshot.timeStarted;
    delete this.openSnapshot.timeStarted;
    this.localStateSnapshots.push(this.openSnapshot);
    this.openSnapshot = undefined;
  }

  // saveStateSnapshots(time, delta) {
  //   const lastSnapshot = this.localStateSnapshots[this.localStateSnapshots.length - 1];
  //   let newVdx = this.vdx;
  //   let newVdy = this.vdy;
  //   let newDirection = this.direction;
  //   let newState = this.stateMachine.currentStateName;
  //   //if something about this characters movement has changed then we should start a new snapshot
  //
  //   if (newVdx !== this.lastVdx || newVdy !== this.lastVdy || newDirection !== this.lastDirection ||
  //     (this.localStateSnapshots.length === 0 && newState !== this.lastState)) {
  //     if (lastSnapshot && !lastSnapshot.duration) {
  //       lastSnapshot.duration = time - lastSnapshot.timeStarted;
  //       delete lastSnapshot.timeStarted;
  //       lastSnapshot.endX = Math.floor(this.x);
  //       lastSnapshot.endY = Math.floor(this.y);
  //     }
  //     // if (newState !== MONSTER_STATES.IDLE) {
  //     console.log('creating snapshots');
  //     this.localStateSnapshots[this.snapShotsLen++] = {
  //       vdx: newVdx,
  //       vdy: newVdy,
  //       endX: undefined,
  //       endY: undefined,
  //       timeStarted: time,
  //       state: newState === "" ? MONSTER_STATES.IDLE : newState,
  //       direction: this.direction,
  //       duration: undefined
  //     };
  //     // }
  //     this.lastVdx = newVdx;
  //     this.lastVdy = newVdy;
  //     this.lastDirection = newDirection;
  //     this.lasState = newState;
  //   } else if (time - this.lastReportTime > SNAPSHOT_REPORT_INTERVAL && this.localStateSnapshots.length > 0) {
  //     //we send all the snapshots we've taken every given interval, providing there are any
  //     if (lastSnapshot && lastSnapshot.duration === undefined) {
  //       lastSnapshot.duration = time - lastSnapshot.timeStarted;
  //     }
  //     delete lastSnapshot.timeStarted;
  //     lastSnapshot.endX = Math.floor(this.x);
  //     lastSnapshot.endY = Math.floor(this.y);
  //     console.log('emitting', this.localStateSnapshots);
  //     eventEmitter.emit("monsterControlDirections", {
  //       monsterId: this.id,
  //       stateSnapshots: this.localStateSnapshots
  //     });
  //     this.localStateSnapshots = [];
  //     this.snapShotsLen = 0;
  //     this.lastReportTime = time;
  //     this.lastVdx = newVdx;
  //     this.lastVdy = newVdy;
  //     this.lastDirection = newDirection;
  //     this.lastState = newState;
  //   }
  // }
}
