import ForestScene from "./scene/ForestScene";
import MMOScene from "./scene/MMOScene";
import Preloader from "./scene/Preloader";
import StarterTown from "./scene/StarterTown";
import ForestPath from "./scene/ForestPath";
<<<<<<< HEAD
import MiddleTown from './scene/MiddleTown';
import Dungeon from './scene/Dungeon';
=======
import MiddleTown from "./scene/MiddleTown";
import MinimapBorder from "./scene/MinimapBorder";
>>>>>>> main

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#000000",
  margin: 0,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  plugins: {},
  scale: {
    parent: "phaser",
    width: 1024, // Game width in pixels
    height: 768, // Game height in pixels
    mode: Phaser.Scale.FIT
  }
};

export class Game extends Phaser.Game {
  constructor() {
    // Add the config file to the game
    super(config);
    this.scene.add("Preloader", Preloader);
    this.scene.add("StarterTown", StarterTown);
    this.scene.add("ForestScene", ForestScene);
    // this.scene.add('MMOScene', MMOScene);
    this.scene.add("ForestPath", ForestPath);
    this.scene.add("MiddleTown", MiddleTown);
    this.scene.add("Dungeon", Dungeon);

    this.scene.add("MinimapBorder", MinimapBorder);
    //starts the game with the main scene
    this.scene.start("Preloader");
  }
}
