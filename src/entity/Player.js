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

import StateMachine from "../StateMachine";
import { createPlayerAnimation } from "../animation/createAnimations";

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} spriteKey
   * @param {string} templateName
   * @param {string} characterName
   * @param {number} id
   * @param {boolean} localPlayer
   */
  constructor(
    scene,
    x,
    y,
    spriteKey,
    templateName,
    characterName,
    id,
    localPlayer = false,
    stuff = "nothing"
  ) {
    super(scene, x, y, spriteKey);
    this.x = x;
    this.y = y;
    this.spriteKey = spriteKey;
    this.scene = scene;
    this.templateName = templateName; //the name of this character
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
    this.characterName = characterName;

    let style = {
      font: "15px",
      align: "center",
      wordWrap: true,
      wordWrapWidth: this.width,
      color: "#554b87",
      shadowColor: ""
    };

    this.nameTag = this.scene.add.text(this.x, this.y, this.characterName, style);
    // this.nameTag.setShadow(1, 1, "rgba(0,0,0,0.5)", 10);

    //Enable physics on this sprite
    this.scene.physics.world.enable(this);

    this.body.offset.x = this.body.width
    this.body.offset.y = this.body.height


    //Create all the animations, running, walking attacking, in all directions of movement
    createPlayerAnimation(this);

    /*************************
     * Multiplayer Variables *
     *************************/
    this.localPlayer = localPlayer; //am I a local player or remote player?

    /*************************
     * Attack *
     *************************/
    this.meleeHitbox = this.scene.add.rectangle(this.x - 60, this.y - 60, 32, 64, 0xffffff, 0);
    this.scene.physics.add.existing(this.meleeHitbox);
    this.meleeHitbox.body.enable = false;
    this.scene.physics.world.remove(this.meleeHitbox.body);

    /*************************
     * State Machine *
     *************************/
    this.stateMachine = new StateMachine(this, this.templateName);
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
      target.stateMachine.setState("hit");
    });

    this.setDepth(5);
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
    if (!this.anims) return;
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
    const animationToPlay = `${this.templateName}-${state}-${convertedDir}`;
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

  //changes the character from run to walk or vice-versa
  toggleMovementMode() {
    this.movementMode = this.movementMode === "walk" ? "run" : "walk";
  }

  update(time, delta) {
    this.nameTag.x = Math.floor(this.x - this.nameTag.width / 2);
    this.nameTag.y = Math.floor(this.y - this.height);
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
}
