import { RemotePlayer } from "../entity/RemotePlayer";
import { LocalPlayer } from "../entity/LocalPlayer";
import { Monster } from "../entity/Monster";
import { eventEmitter } from "../event/EventEmitter";
import {MONSTER_CONTROL_STATES, MONSTER_STATES} from '../entity/MonsterStates';
import {deathFadeout, fadeIn} from '../animation/tweens';

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
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
      //On overlap this function gets called
      eventEmitter.emit("playerChangedScenes", {
        sceneId: transitionZone.sceneId,
        characterId: this.player.id,
        sceneName: transitionZone.sceneName,
        xPos: transitionZone.xPos,
        yPos: transitionZone.yPos
      });
      this.cleanUp();
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
    if (player.characterId !== this.player.id && !this.remotePlayers[player.id]) {
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
    this.monsters[monster.monsterId] = new Monster(
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
  } else {
    console.log("remotePlayerPosition - player not found");
  }
}

export function remotePlayerChangedSceneCallback(remotePlayer) {
  //has the player entered the scene or left the scene?
  //if they exist on remotePlayers, they've likely left, otherwise they entered
  if (this.remotePlayers[remotePlayer.characterId]) {
    this.remotePlayers[remotePlayer.characterId].cleanUp();
    this.remotePlayers[remotePlayer.characterId].destroy();
    delete this.remotePlayers[remotePlayer.characterId];
  } else {
    const boundCallback = nearbyPlayerLoadCallback.bind(this);
    boundCallback([remotePlayer]);
  }
}

export function remotePlayerLoadCallback(data) {
  if (data.characterId !== this.player.id && !this.remotePlayers[data.characterId]) {
    this.remotePlayers[data.characterId] = new RemotePlayer(
      this,
      data.xPos,
      data.yPos,
      `${data.name}-${data.characterId}`,
      data.templateName,
      data.name,
      data.characterId
    );
  }
}

//runs when the server approves an aggro reqeust this monster has made
export function monsterCanAggroPlayerCallback(data) {
  /**
   * @param {Monster[]} monsters
   */
  if (this.monsters[data.monsterId] && data.canAggro) {
    console.log('setting aggro target');
    this.monsters[data.monsterId].aggroZone.setAggroTarget(this.player);
    this.monsters[data.monsterId].controlStateMachine.setState(MONSTER_CONTROL_STATES.CONTROLLING);
  }
  if(!data.canAggro) {
    // this.monsters[data.monsterId].controlStateMachine.setState(MONSTER_CONTROL_STATES. NEUTRAL);
  }
}


export function monsterControlFollowDirectionsCallback(stateSnapshots) {
  /**
   * @param {Monster|undefined} monster
   */
  const monster = this.monsters[stateSnapshots.monsterId];
  if (monster) {
    monster.controlStateMachine.setState(MONSTER_CONTROL_STATES.CONTROLLED);
    monster.remoteSnapshots.push(...stateSnapshots.stateSnapshots);
  } else {
    console.log("monsterControl - monster not found");
  }
}


//runs when the server says a monster should reset it's aggro
export function monsterControlResetAggroCallback(monsterId) {
  if (this.monsters[monsterId]) {
    console.log('control reset aggro callback');
    this.monsters[monsterId].receivedAggroResetRequest = true;
    this.monsters[monsterId].controlStateMachine.setState(MONSTER_CONTROL_STATES.NEUTRAL);
    this.monsters[monsterId].stateMachine.setState(MONSTER_STATES.IDLE);
  }
}

export function monsterHasDiedCallback(monsterId) {
  console.log('monsterHasDied', monsterId);
  if (this.monsters[monsterId]) {
    const monster = this.monsters[monsterId];
    monster.stateMachine.setState(MONSTER_STATES.DEAD);
    monster.controlStateMachine.setState(MONSTER_CONTROL_STATES.NEUTRAL);
    monster.aggroZone.resetAggro(true);
  }
}

export function reviveMonstersCallback(revivedMonsters) {
  for(let i = 0; i < revivedMonsters.length; i++) {
    if (this.monsters[revivedMonsters[i].id]) {
      const monster = this.monsters[revivedMonsters[i].id];
      console.log(revivedMonsters[i], monster);
      monster.stateMachine.setState(MONSTER_STATES.IDLE);
      monster.controlStateMachine.setState(MONSTER_CONTROL_STATES.NEUTRAL);
      monster.aggroZone.resetAggro(true);
      fadeIn(this, monster);
    }
  }
}

export function playerHasDiedCallback(data) {
  console.log('localPlayer has died');
  if(data.local) {
    deathFadeout(this, this.player);
  }
  else {
    console.log('remote player has died');
  }
}

export function localPlayerLogoutCallback() {
  this.cleanup();
  eventEmitter.unsubscribeAll();
}

export function remotePlayerLogoutCallback(remotePlayerCharacterId) {
  if (this.remotePlayers[remotePlayerCharacterId]) {
    this.remotePlayers[remotePlayerCharacterId].cleanUp();
    this.remotePlayers[remotePlayerCharacterId].destroy();
    delete this.remotePlayers[remotePlayerCharacterId];
  }
}
