import Player from '../entity/Player';

export default class MMOScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }


  preload() {
    this.load.path = '/assets/'
    /**How to load an atlas (basically a sprite sheet with a .json file that tells phaser how to find certain animations**/
    this.load.atlas('fox', 'spritesheets/heroes/fox/fox.png', 'spritesheets/heroes/fox/fox.json');

  }

  create() {
    this.player = new Player(this, 100, 100, 'player', 'fox');
    // this.cameras.main.startFollow(this.player);
  }

  /**anything that needs to update, should get it's update function called here**/
  update(time, delta) {
    this.player.update();
  }
}

