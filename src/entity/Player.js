import 'phaser';
import {
  EAST,
  NORTH,
  SOUTH,
  WEST,
} from '../constants/constants';
import {mapToScreen} from '../util/conversion';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey, name) {
    super(scene, x, y, spriteKey);
    this.x = x;
    this.y = y;
    this.spriteKey = spriteKey;
    this.scene = scene;
    this.name = name;
    this.scene.add.existing(this); //adds this sprite to the scene
    this.setInteractive();
    this.speeds = {
      walk: 1,
      run: 2,
    }
    this.mode = 'idle';
    this.direction = SOUTH;
    this.movementMode = 'walk';
    this.animationChanged = false;


    //Physics
    this.scene.physics.world.enable(this);

    //Hotkeys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.createHotKeys();
    

    //Animations
    this.createAnimations();





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
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  createHotKeyEvents() {

  }

  //changes the character from run to walk or vice-versa
  toggleMovementMode() {
    this.movementMode = this.movementMode === 'walk' ? 'run' : 'walk';
  }

  update() {
    this.playAnimation();
  }

  createAnimations() {
    const modes = ['idle', 'walk', 'run'];
    const directions = {
      [NORTH]: {start: 12, end: 15},
      [EAST]: {start: 8, end: 11},
      [SOUTH]: {start: 0, end: 3},
      [WEST]: {start: 4, end: 7},
    }

    for (const [dir, dirOptions] of Object.entries(directions)) {
      for(const mode of modes) {
        console.log(dir, dirOptions);
        const animationName = `${this.name}-${mode}-${dir}`; //what to call the animation so we can refer to it later
        const atlasKey = `${this.name}`; //which atlas should we use
        console.log(animationName, 'prefix', `${atlasKey}_${mode}-`);
        this.anims.create({
          key: animationName,
          frameRate: 10,
          frames: this.anims.generateFrameNames(atlasKey, {
            prefix: `${atlasKey}_${mode}-`, //this will match the file name in the .json file for this atlas
            suffix:".png",
            start: dirOptions.start,
            end: dirOptions.end,
            repeat: -1
          }),
        })
      }
    }



  }


  //assign direction for character & set x,y speed components
  detectKeyInput() {
    const cursors = this.cursors;
    let direction = this.direction;
    let vdX = 0;
    let vdY = 0
    if (cursors.up.isDown) {
      vdY = -1;
      direction =  NORTH;
    }
    else if (cursors.down.isDown) {
      vdY = 1;
      direction = SOUTH;
    }

    if (cursors.right.isDown) {
      vdX = 1;
      direction = EAST;
    }
    else if (cursors.left.isDown) {
      vdX = -1;
      direction = WEST;
    }
    else {
      this.mode = 'idle';
      // console.log('idle');
    }
    return {vdX, vdY, direction}
  }


  playAnimation() {
      const {vdX, vdY, direction} = this.detectKeyInput();
      let mode = this.mode; //save the current
      const animationChanged =  this.direction !== direction || this.mode !== mode;
      this.direction = direction;
      if (vdX !== 0 || vdY !== 0) { //player is moving
        this.mode = this.mode === 'attack' && this.anims.isPlaying ? 'attack' : this.movementMode;
      }
      else { //player is standing still
        this.mode = this.mode === 'attack' && this.anims.isPlaying ? 'attack' : 'idle';
      }
      const animationToPlay  = `${this.name}-${this.mode}-${this.direction}`;
      if (animationChanged || !this.anims.isPlaying) {
        this.anims.play(animationToPlay);
        this.animationChanged = false;
      }
      this.setVelocityX(this.speeds[this.movementMode] * vdX);
      this.setVelocityY(this.speeds[this.movementMode]  * vdY);
  }
}
