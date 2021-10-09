import 'phaser'
import {Player} from '../entity/Player';
import {PathGrid} from '../pathfinding/PathGrid';

export default class MMOScene extends Phaser.Scene {
  constructor() {
    super('MMOScene');
  }


  preload() {


  }

  create() {

    /**creating a map based on a tileset**/
    const map = this.make.tilemap({key: 'starter-town'}) //the key: should match what you specified in this.load.tilemapTiledJSON
    //tileSetName has to match the name of the tileset in Tawiled, and the key is the image key we used for this tile set
    const groundTiles = map.addTilesetImage('town', 'town'); //loads the tileset used to make up this map
    map.createLayer('Ground', groundTiles, 0, 0);
    map.createLayer('trees', groundTiles, 0, 0);
    map.createLayer('trees2', groundTiles, 0, 0);
    map.createLayer('house', groundTiles, 0, 0);
    map.createLayer('Tile Layer 5', groundTiles, 0, 0);
    map.createLayer('rocks', groundTiles, 0, 0);
    let grid = new PathGrid(this, 100);
    // groundLayer.setPipeline('Light2D');

    this.player = new Player(this, grid, 300, 300, 'player', 'fox');
    this.cameras.main.startFollow(this.player);

    const debugGraphics = this.add.graphics().setAlpha(0.75);
    // groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
  }

  /**anything that needs to update, should get it's update function called here**/
  update(time, delta) {
    this.player.update();
  }
}

