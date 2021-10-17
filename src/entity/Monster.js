import { DIRECTION_CONVERSION, EAST, NORTH, SOUTH, WEST } from "../constants/constants";
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

    //my original position
    this.spawnPoint = screenToMap(this.x, this.y);

    //Pathfinding
    this.pathIntervalId = undefined;
    this.pathId = undefined;

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
    this.checkAggroZone();
    this.aggroZone.shadowOwner(); //makes the zone follow the monster it's tied to
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
        }
      } else {
        this.moveTo(this.spawnPoint.x, this.spawnPoint.y);
      }
    }
  }

  moveTo(x, y) {
    const chaseAlongPath = (path) => {
      if (path === null) {
        console.warn("Path was not found.");
        return;
      } else {
        console.log("PATHHHHH", path);
      }
      path = path.slice(1, path.length - 1);
      let pathIndex = 0;
      this.pathIntervalId = window.setInterval(() => {
        if (path[pathIndex]) {
          this.x = path[pathIndex].x * 16;
          this.y = path[pathIndex].y * 16;
          pathIndex++;
        } else {
          window.clearInterval(this.pathIntervalId);
          this.pathIntervalId = undefined;
          this.pathId = undefined;
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
