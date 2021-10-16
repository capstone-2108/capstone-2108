import { DIRECTION_CONVERSION, EAST, NORTH, SOUTH, WEST } from "../constants/constants";
import StateMachine from "../StateMachine";

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

    //Enable physics on this sprite
    this.scene.physics.world.enable(this);
    this.setScale(1.75, 1.75);
    this.setBodySize(22, 22);

    //Create all the animations, running, walking attacking, in all directions of movement
    this.createAnimations();

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
  }

  hitEnter() {
    this.animationPlayer("hit");

    let convertedDir = DIRECTION_CONVERSION[this.direction];
    const flash = (animation, frame) => {
      if (frame.index === 3) {
        // const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        // const endColor = Phaser.Display.Color.ValueToColor(0x000000);
        this.scene.tweens.addCounter({
          from: 0,
          to: 100,
          duration: 200,
          onUpdate: (tween) => {
            const tweenVal = tween.getValue();
            // const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
            //   startColor,
            //   endColor,
            //   100,
            //   tweenVal
            // );
            // const color = Phaser.Display.Color.GetColor(colorObj.r, colorObj.b, colorObj.g);
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

  createAnimations() {
    const directions = [NORTH, EAST, SOUTH, WEST];
    // const threeFrames = {
    //   [NORTH]: { start: 9, end: 11 },
    //   [EAST]: { start: 6, end: 8 },
    //   [SOUTH]: { start: 0, end: 2 },
    //   [WEST]: { start: 3, end: 5 }
    // };
    const fourFrames = {
      [NORTH]: { start: 12, end: 15 },
      [EAST]: { start: 8, end: 11 },
      [SOUTH]: { start: 0, end: 3 },
      [WEST]: { start: 4, end: 7 }
    };

    const states = {
      idle: {
        frameConfigs: {
          // [NORTH]: {0, 1, 2, 1],
          [NORTH]: [
            { frame: "_idle-0", duration: 640 },
            { frame: "_idle-1", duration: 80 },
            { frame: "_idle-2", duration: 640 },
            { frame: "_idle-1", duration: 80 }
          ],
          // [EAST]: [0, 1, 2, 1],
          [EAST]: [
            { frame: "_idle-0", duration: 640 },
            { frame: "_idle-1", duration: 80 },
            { frame: "_idle-2", duration: 640 },
            { frame: "_idle-1", duration: 80 }
          ],
          [SOUTH]: [
            { frame: "_idle-0", duration: 640 },
            { frame: "_idle-1", duration: 80 },
            { frame: "_idle-2", duration: 640 },
            { frame: "_idle-1", duration: 80 }
          ],
          [WEST]: [
            { frame: "_idle-0", duration: 640 },
            { frame: "_idle-1", duration: 80 },
            { frame: "_idle-2", duration: 640 },
            { frame: "_idle-1", duration: 80 }
          ]
        },
        repeat: "yoyo"
      },
      hit: {
        frameConfigs: {
          // [NORTH]: [9, 10, 11, 10, 11, 9],
          [NORTH]: [
            { frame: "_hit-9", duration: 120 },
            { frame: "_hit-10", duration: 80 },
            { frame: "_hit-11", duration: 80 },
            { frame: "_hit-10", duration: 80 },
            { frame: "_hit-11", duration: 80 },
            { frame: "_hit-9", duration: 80 }
          ],
          // [EAST]: [6, 7, 8, 7, 8, 6],
          [EAST]: [
            { frame: "_hit-6", duration: 120 },
            { frame: "_hit-7", duration: 80 },
            { frame: "_hit-8", duration: 80 },
            { frame: "_hit-7", duration: 80 },
            { frame: "_hit-8", duration: 80 },
            { frame: "_hit-6", duration: 80 }
          ],
          // [SOUTH]: [0, 1, 2, 1, 2, 0],
          [SOUTH]: [
            { frame: "_hit-0", duration: 120 },
            { frame: "_hit-1", duration: 80 },
            { frame: "_hit-2", duration: 80 },
            { frame: "_hit-1", duration: 80 },
            { frame: "_hit-2", duration: 80 },
            { frame: "_hit-0", duration: 80 }
          ],
          // [WEST]: [3, 4, 5, 4, 5, 3]
          [WEST]: [
            { frame: "_hit-3", duration: 120 },
            { frame: "_hit-4", duration: 80 },
            { frame: "_hit-5", duration: 80 },
            { frame: "_hit-4", duration: 80 },
            { frame: "_hit-5", duration: 80 },
            { frame: "_hit-3", duration: 80 }
          ]
        }
      },
      walk: {
        frameConfigs: {
          // [NORTH]: [12, 13, 14, 15],
          [NORTH]: [
            { frame: "_walk-12", duration: 120 },
            { frame: "_walk-13", duration: 120 },
            { frame: "_walk-14", duration: 120 },
            { frame: "_walk-15", duration: 120 }
          ],
          // [EAST]: [8, 9, 10, 11],
          [EAST]: [
            { frame: "_walk-8", duration: 120 },
            { frame: "_walk-9", duration: 120 },
            { frame: "_walk-10", duration: 120 },
            { frame: "_walk-11", duration: 120 }
          ],
          // [SOUTH]: [0, 1, 2, 3],
          [SOUTH]: [
            { frame: "_walk-0", duration: 120 },
            { frame: "_walk-1", duration: 120 },
            { frame: "_walk-2", duration: 120 },
            { frame: "_walk-3", duration: 120 }
          ],
          // [WEST]: [4, 5, 6, 7]
          [WEST]: [
            { frame: "_walk-4", duration: 120 },
            { frame: "_walk-5", duration: 120 },
            { frame: "_walk-6", duration: 120 },
            { frame: "_walk-7", duration: 120 }
          ]
        }
      },
      attack: {
        frameConfigs: {
          // [NORTH]: [12, 13, 14, 15],
          [NORTH]: [
            { frame: "_attack-12", duration: 300 },
            { frame: "_attack-13", duration: 100 },
            { frame: "_attack-14", duration: 100 },
            { frame: "_attack-15", duration: 200 }
          ],
          // [EAST]: [8, 9, 10, 11],
          [EAST]: [
            { frame: "_attack-8", duration: 300 },
            { frame: "_attack-9", duration: 100 },
            { frame: "_attack-10", duration: 100 },
            { frame: "_attack-11", duration: 200 }
          ],
          // [SOUTH]: [0, 1, 2, 3],
          [SOUTH]: [
            { frame: "_attack-0", duration: 300 },
            { frame: "_attack-1", duration: 100 },
            { frame: "_attack-2", duration: 100 },
            { frame: "_attack-3", duration: 200 }
          ],
          // [WEST]: [4, 5, 6, 7]
          [WEST]: [
            { frame: "_attack-4", duration: 300 },
            { frame: "_attack-5", duration: 100 },
            { frame: "_attack-6", duration: 100 },
            { frame: "_attack-7", duration: 200 }
          ]
        }
      }
    };

    for (const [stateName, config] of Object.entries(states)) {
      for (const [direction, frameConfigs] of Object.entries(config.frameConfigs)) {
        let frameNames = [];
        for (let i = 0; i < frameConfigs.length; i++) {
          console.log("key name", this.name + frameConfigs[i].frame);
          frameNames.push({
            key: this.name,
            frame: this.name + frameConfigs[i].frame + ".png",
            delay: frameConfigs[i].delay,
            duration: frameConfigs[i].duration
          });
        }
        const animationName = `${this.name}-${stateName}-${direction}`; //what to call the animation so we can refer to it later
        console.log("animationName", animationName);
        console.log("frameNames", frameNames);
        this.anims.create({
          key: animationName,
          frameRate: 10,
          frames: frameNames
          // repeat: frameConfigs.repeat
        });
      }

      // for (const [frameDirection, framesConfig] of Object.entries(animationOptions.framesConfigs)) {
      //   const animationName = `${this.name}-${stateName}-${frameDirection}`; //what to call the animation so we can refer to it later
      //   //iterate over the
      //   console.log("creating animation", animationName);
      //   const atlasKey = `${this.name}`; //which atlas should we use
      //   const frameNames = framesConfig.map((frameNumber) => {
      //     console.log('frameNumber', frameNumber);
      //       // `${atlasKey}_${stateName}-${frameNumber}.png`
      //     }
      //   );
      //   console.log("frameNames", frameNames);
      //   this.anims.create({
      //     key: animationName,
      //     frameRate: 10,
      //     frames: frameNames
      //   });
      // }
    }
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
}
