import { Player } from "../entity/Player";
import { RemotePlayer } from "../entity/RemotePlayer";
import { LocalPlayer } from "../entity/LocalPlayer";
import { eventEmitter } from "../event/EventEmitter";


export function scenePlayerLoadCallback(data) {
  this.player = new LocalPlayer(
    this,
    data.xPos,
    data.yPos,
    "player",
    data.templateName,
    data.name,
    data.characterId
  );

  console.log("scenePlayerloadCallback")
  this.transitionZones.forEach((transitionZone) => {
    this.physics.add.overlap(transitionZone.transitionPoint, this.player, () => {
      console.log('THIS', this.player.id)
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
      //On overlap this function gets called
      eventEmitter.emit("playerChangedScenes", {
        sceneId: transitionZone.sceneId, characterId: this.player.id, sceneName: transitionZone.sceneName
      })
      this.scene.start(transitionZone.sceneName);
    });
  });

  this.cameras.main.startFollow(this.player);
  this.minimap = this.cameras
    .add(795, 0, 230, 230)
    .setZoom(0.15)
    .setName("mini")
    .startFollow(this.player);
  this.minimap.setBackgroundColor(0x002244);

  this.minimap.centerOn(0, 0);
  const minimapCircle = new Phaser.GameObjects.Graphics(this);
  minimapCircle.fillCircle(910, 115, 110);
  minimapCircle.fillCircle(910, 115, 110, "mini");

  const circle = new Phaser.Display.Masks.GeometryMask(this, minimapCircle);
  this.minimap.setMask(circle, true);
  this.layers.forEach((layer) => {
    this.physics.add.collider(this.player, layer);
  });
  this.physics.add.overlap(this.monster.aggroZone, this.player, (aggroZone, player) => {
    aggroZone.setAggroTarget(player);
  });
}

export function nearbyPlayerLoadCallback(players) {
  console.log('got nearby players and this', this, players)
  let i = 0;
  let len = players.length;
  for (; i < len; i++) {
    const player = players[i];
    if (player.characterId !== this.player.characterId && !this.otherPlayers[player.characterId]) {
      this.otherPlayers[player.characterId] = new RemotePlayer(
        this,
        player.xPos,
        player.yPos,
        `${player.name}-${player.characterId}`,
        player.templateName,
        player.name,
        player.characterId
      );
    }
  }
}

export function remotePlayerPositionChangedCallback(stateSnapshots) {
  //set a `move to` position, and let update take care of the rest
  //should consider making `moveTo` stateSnapshots a queue in case more events come in before
  //the player character has finished moving
  const remotePlayer = this.otherPlayers[stateSnapshots.characterId];
  if (remotePlayer) {
    remotePlayer.stateSnapshots = remotePlayer.stateSnapshots.concat(stateSnapshots.stateSnapshots);
  }
}

export function otherPlayerLoadCallback(data) {
  if (data.id !== this.player.id && !this.otherPlayers[data.id]) {
    this.otherPlayers[data.id] = new RemotePlayer(
      this,
      data.xPos,
      data.yPos,
      `${data.name}-${data.id}`,
      data.templateName,
      data.name,
      data.id
    );
  }
}
