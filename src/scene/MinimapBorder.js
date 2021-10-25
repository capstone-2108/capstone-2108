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
        x: 909,
        y: 115,
        stepX: 16
      },
      quantity: 1
    });
  }
}
