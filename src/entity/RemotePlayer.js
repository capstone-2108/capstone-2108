import { Player } from "./Player";

export class RemotePlayer extends Player {
  constructor(scene, x, y, spriteKey, name, id) {
    super(scene, x, y, spriteKey, name, id, false);
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
