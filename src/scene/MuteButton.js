export default class MuteButton extends Phaser.Scene {
  constructor() {
    super({ key: "muteButton" });
  }
  create() {
    const muteIcon = this.add.image(50, 50, "mute").setScale(3);
  }
}
