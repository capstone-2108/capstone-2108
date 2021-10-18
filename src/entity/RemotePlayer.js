import { Player } from "./Player";
import { eventEmitter } from "../event/EventEmitter";


export class RemotePlayer extends Player {
  constructor(scene, x, y, spriteKey, templateName, characterName, id) {
    super(scene, x, y, spriteKey, templateName, characterName, id, false);
    this.stateSnapshots = []; //where we store state snapshots sent from the server to control this character
    this.nextStatesSnapshot = null; //the next snapshot to play
    this.stateSnapshotStartTime = null; //the start time of the currently playing snapshot

    this.clickPlayer();
  }

  clickPlayer() {
    this.on("pointerup", (evt) => {
      console.log("you clicked me", this.id, this.characterName);
      eventEmitter.emit("requestPlayerInfo", this.id);
    });
  }

  update(time, delta) {
    this.playRemotePlayerSnapshots(time, delta);
    if (this.stateMachine.currentStateName !== "melee") {
      let vdx = 0;
      let vdy = 0;
      let direction = this.direction;
      if (this.nextStatesSnapshot) {
        vdx = this.nextStatesSnapshot.vdx;
        vdy = this.nextStatesSnapshot.vdy;
        direction = this.getDirectionFromVelocity(vdx, vdy);
      }
      this.direction = direction;
      if (vdx !== 0 || vdy !== 0) {
        this.stateMachine.setState(`walk`); //we can only walk if we're not attacking
      } else {
        this.stateMachine.setState("idle");
      }
      this.stateMachine.setState(this.nextStatesSnapshot ? this.nextStatesSnapshot.state : "idle");
    }
    this.stateMachine.update(time, delta);
    super.update(time, delta);
  }

  playRemotePlayerSnapshots(time, delta) {
    let state = this.stateMachine.currentStateName;
    if (this.stateSnapshots.length && !this.nextStatesSnapshot) {
      this.setOtherPlayerNextStatesSnapshot(this.stateSnapshots.shift());
    }
    if (this.nextStatesSnapshot) {
      if (!this.stateSnapshotStartTime) {
        this.stateSnapshotStartTime = time;
        state = this.nextStatesSnapshot.state;
      }
      //switch to next stateSnapshot upon completion of this one
      if (time - this.stateSnapshotStartTime >= this.nextStatesSnapshot.duration) {
        this.moveToCoordinate(this.nextStatesSnapshot.endX, this.nextStatesSnapshot.endY);
        this.setOtherPlayerNextStatesSnapshot(this.stateSnapshots.shift());
        this.stateSnapshotStartTime = null;
      }
    }
    this.setState(state);
  }

  //for remote players, will set the next state stateSnapshot for movement / attacking
  setOtherPlayerNextStatesSnapshot(stateSnapshot) {
    this.nextStatesSnapshot = stateSnapshot;
  }
}
