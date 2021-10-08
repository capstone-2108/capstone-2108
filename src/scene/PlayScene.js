import Player from '../entity/Player';

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  /**
   * The preload function is where you load all the assets you'll need for a scene, like images, sounds, maps, tilesets, etc
   */
  preload() {
    // this.load.path = '/public/assets/'

    //How to load a map, this is a .json file which tells phaser how to layout a map, you can generate this in the Tiled application
    // this.load.tilemapTiledJSON('starter-town', '/path/to/asset/starter-town.json');

    /**How to load a tile set**/
    // this.load.image('ground-tiles', '/path/to/asset/tiles/ground-tiles.png');

    /**How to load an image**/
    // this.load.image('control-panel', '/control-panel.png');

    /**How to load an atlas (basically a sprite sheet with a .json file that tells phaser how to find certain animations**/
    // this.load.atlas('AMTNBOW', 'AMTNBOW/AMTNBOW.png', 'AMTNBOW/AMTNBOW.json');

    /**How to load a sound file**/
    // this.load.audio('background-music', '/path/to/asset/music.mp3');
  }

  /**
   * The create function is where you actually start placing things within a scene
   */
  create() {

    /**How to write text on the screen**/
    // this.text = this.add.text(100, 100, 'Hello World', { fontSize: "24px", fontFamily: 'arial', fill: '#00ff00' }).setScrollFactor(0);

    /**creating a map based on a tileset
    const map = this.make.tilemap({key: 'starter-town'}) //the key: should match what you specified in this.load.tilemapTiledJSON
    const groundTiles = map.addTilesetImage('ground-tiles'); //loads the tileset used to make up this map

    const groundLayer = map.createLayer('groundLayer', groundTiles);
    groundLayer.setPipeline('Light2D');

    /**creates a player the places them at the position x:100 y:100
    this.player = new Player(this, 100, 100, 'player');
    this.cameras.main.startFollow(this.player);

    /**how to play sounds
    this.bgm = this.sound.add('background-music', {volume: .1, loop: true, delay: 0}); //add the sound to the scene
    this.bgm.play(); //play it like this

    //Pathfinding
    const collisionLayers = [stoneWallLayer, stoneWallLayer2];
    this.pathFinding = new PathFinding(this, 35, collisionLayers);

    /****************
     * Events
     * **************/
    /**Creates and event for when the user clicks some place**/
    // this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
    //   const { worldX, worldY } = pointer;
    //   console.log('clicked on', worldX, worldY);
    // });

    /**remember to clean up on Scene shutdown**/
    // this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
    //   this.input.off(Phaser.Input.Events.POINTER_UP)
    // })

    /**sets up an event for certain keys**/
    // let oneKey = this.input.keyboard.addKey('1');
    // oneKey.on('down', () => {
    //   console.log('user pressed the 1 key');
    // });
  }

  /**anything that needs to update, should get it's update function called here**/
  update(time, delta) {
    // this.player.update();
  }
}

