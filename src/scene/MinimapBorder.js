import Phaser from "phaser";

export default class MinimapBorder extends Phaser.Scene {
  constructor() {
    super({ key: "minimapBorder" });
  }
  create() {
    const blackRing = this.add.group();

    blackRing.createMultiple({
      key: "minimapBorder",

      setXY: {
        x: 915,
        y: 120,
        stepX: 16
      },
      quantity: 1
    });
  }
}
