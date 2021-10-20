import { RemotePlayer } from "../entity/RemotePlayer";
import { LocalPlayer } from "../entity/LocalPlayer";
import { Monster } from "../entity/Monster";
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

  this.transitionZones.forEach((transitionZone) => {
    this.physics.add.overlap(transitionZone.transitionPoint, this.player, () => {
      console.log("transitionpoint", transitionZone.transitionPoint);
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
      //On overlap this function gets called
      eventEmitter.emit("playerChangedScenes", {
        sceneId: transitionZone.sceneId,
        characterId: this.player.id,
        sceneName: transitionZone.sceneName
      });
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
  // this.physics.add.overlap(this.monsterAggroZones, this.player, (aggroZone, player) => {
  //   console.log(aggroZone, player);
  //   aggroZone.setAggroTarget(player);
  // });
}

export function nearbyPlayerLoadCallback(players) {
  // console.log('got nearby players and this', this, players)
  let i = 0;
  let len = players.length;
  for (; i < len; i++) {
    const player = players[i];
    if (player.characterId !== this.player.characterId && !this.remotePlayers[player.characterId]) {
      this.remotePlayers[player.characterId] = new RemotePlayer(
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

export function nearbyMonsterLoadCallback(monsters) {
  let i = 0;
  let len = monsters.length;
  for (; i < len; i++) {
    const monster = monsters[i];
    this.monsters[monster.characterId] = new Monster(
      this,
      monster.xPos,
      monster.yPos,
      `${monster.name}-${monster.monsterId}`,
      monster.templateName,
      monster.monsterId
    );
  }
}

export function remotePlayerPositionChangedCallback(stateSnapshots) {
  //set a `move to` position, and let update take care of the rest
  //should consider making `moveTo` stateSnapshots a queue in case more events come in before
  //the player character has finished moving
  const remotePlayer = this.remotePlayers[stateSnapshots.characterId];
  if (remotePlayer) {
    remotePlayer.stateSnapshots = remotePlayer.stateSnapshots.concat(stateSnapshots.stateSnapshots);
  }
}

export function remotePlayerLoadCallback(data) {
  if (data.id !== this.player.id && !this.remotePlayers[data.id]) {
    this.remotePlayers[data.id] = new RemotePlayer(
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

export function localPlayerLogoutCallback() {
  this.player.destroy();
  this.player = undefined;
  for (const [id, remotePlayer] of Object.entries(this.remotePlayers)) {
    remotePlayer.destroy();
  }
  this.remotePlayers = {};
  for (const [id, monster] of Object.entries(this.monsters)) {
    monster.aggroZone.destroy();
    monster.destroy();
  }
  this.monsters = {};
  this.unsubscribes.forEach((unsubscribe) => unsubscribe());
}

export function remotePlayerLogoutCallback(remotePlayerCharacterId) {
  if (this.remotePlayers[remotePlayerCharacterId]) {
    console.log("test");
    this.remotePlayers[remotePlayerCharacterId].destroy();
    delete this.remotePlayers[remotePlayerCharacterId];
  }
}
