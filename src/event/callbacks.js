import { Player } from "../entity/Player";

export function scenePlayerLoadCallback(data) {
  this.player = new Player(
    this,
    data.xPos,
    data.yPos,
    "player",
    data.templateName,
    true,
    data.characterId
  );

  this.transitionZones.forEach((transitionZone) => {
    this.physics.add.overlap(transitionZone.transitionPoint, this.player, () => {
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
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
  let i = 0;
  let len = players.length;
  for (; i < len; i++) {
    const player = players[i];
    if (player.characterId !== this.player.characterId && !this.otherPlayers[player.characterId]) {
      this.otherPlayers[player.characterId] = new Player(
        this,
        player.xPos,
        player.yPos,
        `${player.name}-${player.characterId}`,
        player.templateName,
        false,
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
    this.otherPlayers[data.id] = new Player(
      this,
      data.xPos,
      data.yPos,
      `${data.name}-${data.id}`,
      data.templateName,
      false,
      data.id
    );
  }
}
