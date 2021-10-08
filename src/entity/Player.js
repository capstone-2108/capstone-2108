import 'phaser';
import {
  EAST,
  NORTH,
  SOUTH,
  WEST,
} from '../constants/constants';
import {mapToScreen} from '../util/conversion';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey) {
    super(scene, x, y, spriteKey);
    this.x = x;
    this.y = y;
    this.spriteKey = spriteKey;
    this.scene = scene;
    this.scene.add.existing(this); //adds this sprite to the scene
    this.setInteractive();

    //Physics
    this.scene.physics.world.enable(this);

    //Hotkeys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.createHotKeys();


    // this.direction = SOUTH;
    // this.movementModeChanged = false;
    // this.animationChanged = false; //if something triggers a change which should cause the current animation to change
    // this.speed = 100; //the speed of the player
    // this.vdX = 0;
    // this.vdY = 0;
    // this.dx = 0;
    // this.dy = 0;
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

    //Animations
    this.createAnimations();

    //Sounds
    // this.createSound();





  }

  clearPath() {
    this.vdX = 0;
    this.vdY = 0;
    this.dx = 0;
    this.dy = 0;
    this.isMoving = false;
    this.animationChanged = true;
    this.previousWaypoint = undefined;
    this.nextWaypoint = undefined;
    this.wayPointIndex = 0;
    this.isMoving = false;
  }

  moveToCoordinate(x, y) {
    // let playerXOffset = 8;
    // let playerYOffset = -30;
    this.x = x //+ playerXOffset;
    this.y = y //+ playerYOffset;
  }

  moveToTile(x,y) {
    const [screenX, screenY] = mapToScreen(x,y);
    this.x = screenX;
    this.y = screenY;
  }


  createHotKeys() {
    this.scene.input.keyboard.on('keydown-' + 'R', (evt) => {
     console.log('r pressed');
    });

    this.cursors.shift.on('down', () => {
      console.log('shift pressed');
    })

  }

  update() {
    //updateMovement etc
  }

  createAnimations() {

  }


  //assign direction for character & set x,y speed components
  detectKeyInput() {
    let vdX = 0;
    let vdY = 0;
    let direction = this.direction;
    const cursors = this.cursors;
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
      vdY = 0;
    }

    return {vdX, vdY, direction}
  }


  cursorMovement() {
      const {vdX, vdY, direction} = this.detectKeyInput();
      if (vdX !== 0 || vdY !== 0) {
        this.isMoving = true;
      }
      else {
        this.isMoving = false;
      }
      this.setVelocityX(this.speed * vdX);
      this.setVelocityY(this.speed * vdY);
  }
}
