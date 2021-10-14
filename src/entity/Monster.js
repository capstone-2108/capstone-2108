import {DIRECTION_CONVERSION, EAST, NORTH, SOUTH, WEST} from '../constants/constants';

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

    //Create all the animations, running, walking attacking, in all directions of movement
    this.createAnimations();
  }

  update(time, delta) {
    this.playAnimation();
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

  playAnimation(waypoint = undefined) {
    let vdy = 0;
    let vdx = 0;
    let direction = this.direction;
    let animationChanged = false;
    let mode = this.mode; //save the current mode

    //if there is velocity, then the player is considered to be moving
    if (vdx !== 0 || vdy !== 0) {
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : this.movementMode;
      mode = this.mode;
    } else {
      //player is standing still
      this.mode = this.mode === "attack" && this.anims.isPlaying ? "attack" : "idle";
      mode = this.mode;
    }

    //note if the direction changed or if the mode changed, if so, then we have to play a different animation
    animationChanged = direction !== this.direction || this.mode !== mode;
    direction = this.direction;

    let convertedDir = DIRECTION_CONVERSION[direction];
    const animationToPlay = `${this.name}-${this.mode}-${convertedDir}`;
    if (animationChanged || !this.anims.isPlaying) {
      this.anims.play(animationToPlay);
    }
    this.setVelocityX(this.speeds[this.movementMode] * vdx);
    this.setVelocityY(this.speeds[this.movementMode] * vdy);
    return { vdx, vdy, direction, mode };
  }
}
