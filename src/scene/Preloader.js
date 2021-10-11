import 'phaser'

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    this.load.path = '/assets/'
    /**How to load an atlas (basically a sprite sheet with a .json file that tells phaser how to find certain animations**/
    this.load.atlas('fox', 'spritesheets/heroes/fox/fox.png', 'spritesheets/heroes/fox/fox.json');
    this.load.atlas('sorcerer', 'spritesheets/heroes/sorcerer/sorcerer.png', 'spritesheets/heroes/sorcerer/sorcerer.json');


    //How to load a map, this is a .json file which tells phaser how to layout a map, you can generate this in the Tiled application
    this.load.tilemapTiledJSON('start-scene', '/maps/start-scene.json');

    /**How to load a tile set**/
    this.load.image('town', 'tilesets/tileset/RPG tileset (full) v1.5 - 200_.png');

  }

  create() {
    this.scene.launch('MMOScene');
  }
}
