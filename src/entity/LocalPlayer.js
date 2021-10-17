const {Player} = require('./Player');

class LocalPlayer extends Player {
  constructor(scene, x, y, spriteKey, name, id) {
    super(scene, x, y, spriteKey, name, id, true);
  }

  createHotKeys() {
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.scene.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      this.stateMachine.setState("melee");
    });
  }

  update(time, delta) {
    if (this.localPlayer) {
      this.saveStateSnapshots(time, delta);
    } else {
      this.playRemotePlayerSnapshots(time, delta);
    }
    if (this.stateMachine.currentStateName !== "melee") {
      let vdx = 0;
      let vdy = 0;
      let direction = this.direction;
      if (this.localPlayer) {
        let moveData = this.detectKeyInput();
        vdx = moveData.vdx;
        vdy = moveData.vdy;
        direction = moveData.direction;
      }
      if (!this.localPlayer && this.nextStatesSnapshot) {
        vdx = this.nextStatesSnapshot.vdx;
        vdy = this.nextStatesSnapshot.vdy;
        direction = this.getDirectionFromVelocity(vdx, vdy);
      }
      this.direction = direction;
      if (this.localPlayer) {
        if (vdx !== 0 || vdy !== 0) {
          this.stateMachine.setState(`walk`); //we can only walk if we're not attacking
        } else {
          this.stateMachine.setState("idle");
        }
      } else {
        this.stateMachine.setState(
          this.nextStatesSnapshot ? this.nextStatesSnapshot.state : "idle"
        );
      }
    }
    this.stateMachine.update(time, delta);
  }
}