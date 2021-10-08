export default {
  type: Phaser.AUTO,  // Specify the underlying browser rendering engine (AUTO, CANVAS, WEBGL)
                      // AUTO will attempt to use WEBGL, but if not available it'll default to CANVAS
  width: 1920,   // Game width in pixels
  height: 1080,  // Game height in pixels
  backgroundColor: '#000000',
  margin:0,
  parent: 'phaser',
  // render: {
  //   pixelArt: true,
  // },
  //  We will be expanding physics later
  physics: {
    // default: 'matter',
    // matter: {
    //   debug: true,
    //   gravity: {x:0, y:0},
    //   // showCollisions: true
    // },
    default: 'arcade',
    arcade: {
      // gravity: { x:300, y: 300},  // Game objects will be pulled down along the y-axis
      // The number 1500 is arbitrary. The higher, the stronger the pull.
      // A negative value will pull game objects up along the y-axis
      debug: true,     // Whether physics engine should run in debug mode
    }
  },
};
