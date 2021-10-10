
import MMOScene from './scene/MMOScene';
import Preloader from './scene/Preloader';

const config = {
  type: Phaser.AUTO,  // Specify the underlying browser rendering engine (AUTO, CANVAS, WEBGL)
                      // AUTO will attempt to use WEBGL, but if not available it'll default to CANVAS

  backgroundColor: '#000000',
  margin:0,

  // render: {
  //   pixelArt: true,
  // },
  //  We will be expanding physics later
  physics: {
    // default: 'matter',
    // matter: {
    //   debug: true,
    //   gravity: { y:0},
    //   // showCollisions: true
    // },
    default: 'arcade',
    arcade: {
      gravity: { y: 0},  // Game objects will be pulled down along the y-axis
      debug: true,
    }
  },
  plugins: {

  },
  scale: {
    parent: 'phaser',
    width: 1024,   // Game width in pixels
    height: 768,  // Game height in pixels
    mode: Phaser.Scale.FIT
  }
};



export class Game extends Phaser.Game {
  constructor() {
    // Add the config file to the game
    super(config);
    this.scene.add('Preloader', Preloader);
    this.scene.add('MMOScene', MMOScene);

    //starts the game with the main scene
    this.scene.start('Preloader');
  }
}
