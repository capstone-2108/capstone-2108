import React, { useEffect, useState } from "react";
import { eventEmitter } from "../../src/event/EventEmitter";
import player, {
  fetchCharacterData,
  fetchNearbyMonsters,
  fetchNearbyPlayers,
  fetchRemoteCharacterData,
  fetchSelectedMonster,
  heartbeat,
  localPlayerTookDamage,
  logoutCharacters,
  monsterTookDamage,
  playerTookDamage,
  remotePlayerChangedScenes,
  remotePlayerTookDamage,
  reviveMonsters, revivePlayer,
  setSelectedUnit,
  updateLocalPlayerPosition,
  updatePlayerPosition,
  playerExpIncrease,
  updateHealth, updateMonsterPosition
} from '../store/player';

import { useDispatch, useSelector } from "react-redux";
import { Game } from "../../src/Game";
import io from "socket.io-client";
import { updatePlayerCharacter } from "../store/player";
import { logout } from "../store";

//this is a fake component which handles our event subscriptions
//we're using a functional component because we need access to hooks

export const InitSubscriptionsToPhaser = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const playerState = useSelector((state) => state.player);
  let lastPlayerPositionUpdate = Date.now();
  let healthIntervalId;

  useEffect(() => {
    /****************
     * Intervals *
     ***************/
    if (playerState.characterId && socket) {
      healthIntervalId = window.setInterval(() => {
        if (playerState.health !== playerState.totalHealth) {
          socket.emit("healthIntervalIncrease", playerState.characterId);
        }
      }, 10000);
    }
    return () => window.clearInterval(healthIntervalId);
  }, [playerState.characterId, socket]);


  useEffect(() => {
    //loads the game
    window.game = new Game();

    /****************
     * Socket.io *
     ***************/
    //sets up a socket for 2 way persistent communication via socket.io
    const newSocket = io(`${window.location.protocol}//${window.location.host}/gameSync`, {
      withCredentials: true
    });
    setSocket(newSocket); //save the socket into the component state

    // listens for other players loading in
    newSocket.on("remotePlayerLoad", (data) => {
      eventEmitter.emit("remotePlayerLoad", data);
    });

    newSocket.on("remotePlayerLogout", (characterId) => {
      eventEmitter.emit("remotePlayerLogout", characterId);
    });

    //this is where the server lets us know that others players have moved, once we receive this signal we
    //tell phaser to move those characters on the screen
    newSocket.on("remotePlayerPositionChanged", (position) => {
      //this is how we tell phaser that another player has moved
      eventEmitter.emit("remotePlayerPositionChanged", position);
    });

    //server lets us know that a remote player has changed scenes
    newSocket.on("remotePlayerChangedScenes", (remotePlayer) => {
      //lets tell phaser that this player has changed scenes so it can update accordingly
      //if they entered my scene, lets add them to redux, otherwise remove,
      dispatch(remotePlayerChangedScenes(remotePlayer));
      eventEmitter.emit("remotePlayerChangedScenes", remotePlayer);
    });

    newSocket.on("heartbeatCheck", async (data) => {
      dispatch(heartbeat(newSocket));
    });

    //server is letting us know that a monster can aggro a player
    newSocket.on("monsterCanAggroPlayer", async (data) => {
      // console.log("monster can aggro player", data);
      eventEmitter.emit("monsterCanAggroPlayer", data);
    });

    //server is letting us know that a monster need to start following this path
    // newSocket.on("monsterAggroFollowPath", (data) => {
    //   // console.log('received monster aggro path', data);
    //   eventEmitter.emit("monsterAggroFollowPath", data);
    // });

    //controlling monster has reset
    newSocket.on("monsterControlResetAggro", (data) => {
      // console.log("reset aggro", data);
      eventEmitter.emit("monsterControlResetAggro", data);
    });

    newSocket.on("monsterFollowDirections", (data) => {
      eventEmitter.emit("monsterFollowDirections", data);
    });

    //received a message to register a hit on a monster from another player
    newSocket.on("monsterTookDamage", (data) => {
      dispatch(monsterTookDamage(data));
      if (!data.monster.isAlive) {
        eventEmitter.emit("monsterHasDied", data.monster.id);
      }
      // eventEmitter.emit("remotePlayerHitMonster", data);
    });

    //received a message to register a hit on a player
    newSocket.on("playerTookDamage", (data) => {
      dispatch(playerTookDamage(data));
      if (!data.playerCharacter.isAlive) {
        eventEmitter.emit("playerHasDied", data);
      }
    });

    //received a message from the server that we should revive monsters
    newSocket.on("reviveMonsters", (monsters) => {
      dispatch(reviveMonsters(monsters));
      eventEmitter.emit("reviveMonsters", monsters);
    });

    newSocket.on("playerExpIncrease", (experience) => {
      dispatch(playerExpIncrease(experience));
    });

    newSocket.on("healthIntervalIncrease", (health) => {
      dispatch(updateHealth(health));
    });

    newSocket.on("updateMonsterPosition", (data) => {
      const {monsterId, xPos, yPos} = data;
      // console.log('phaserSync updateMonsterPosition', data);
      // dispatch(updateMonsterPosition({monsterId, xPos, yPos}));
      eventEmitter.emit("updateMonsterPosition", {monsterId, xPos, yPos});
    });

    /****************
     * Event Emitter *
     ***************/
    //Subscribes to an event which lets us know when phaser has fully loaded
    const unsubscribes = [];

    unsubscribes.push(
      eventEmitter.subscribe("phaserLoad", async (data) => {
        const player = await dispatch(fetchCharacterData()); //load the players data into redux
        eventEmitter.emit("playerLoad", player);
        dispatch(heartbeat(newSocket));
      })
    );

    unsubscribes.push(
      eventEmitter.subscribe("sceneLoad", async (data) => {
        const player = await dispatch(fetchCharacterData()); //load the players data into redux
        eventEmitter.emit("scenePlayerLoad", player);
        //load any players which are in the same scene as the player
        const nearbyPlayers = await dispatch(fetchNearbyPlayers(player.characterId));
        eventEmitter.emit("nearbyPlayerLoad", nearbyPlayers);
        const nearbyMonsters = await dispatch(fetchNearbyMonsters(player.sceneId));
        eventEmitter.emit("nearbyMonsterLoad", nearbyMonsters);
      })
    );

    //phaser lets us know when the local player moves to another scene
    unsubscribes.push(
      eventEmitter.subscribe("playerChangedScenes", async (data) => {
        //update store state with new sceneName and sceneId for this player
        dispatch(
          updatePlayerCharacter({
            sceneName: data.sceneName,
            sceneId: data.sceneId,
            xPos: data.xPos,
            yPos: data.yPos
          })
        );
        //let the server know about the changes
        newSocket.emit("playerChangedScenes", data);
      })
    );

    //this is used for generic updates from phaser which just need to be passed on to the server
    //and which react doesn't need to do anything beyond that
    unsubscribes.push(
      eventEmitter.subscribe("localPlayerPositionChanged", (data) => {
        if (Date.now() - lastPlayerPositionUpdate > 2000) {
          dispatch(updateLocalPlayerPosition(data.stateSnapshots[data.stateSnapshots.length - 1]));
          lastPlayerPositionUpdate = Date.now();
        }
        newSocket.emit("localPlayerPositionChanged", data);
      })
    );

    //phaser is making a request to fetch some player data
    unsubscribes.push(
      eventEmitter.subscribe("requestPlayerInfo", (characterId) => {
        dispatch(setSelectedUnit("player", characterId));
      })
    );

    //phaser is making a request to fetch some monster data
    unsubscribes.push(
      eventEmitter.subscribe("requestMonsterInfo", (monsterId) => {
        dispatch(setSelectedUnit("monster", monsterId));
      })
    );

    //phaser lets us know that a monster wants to aggro a player
    unsubscribes.push(
      eventEmitter.subscribe("monsterAggroedPlayer", ({ monsterId, playerCharacterId }) => {
        newSocket.emit("monsterAggroedPlayer", { monsterId, playerCharacterId });
      })
    );

    //phaser is letting us know that a monster's aggro has reset
    unsubscribes.push(
      eventEmitter.subscribe("monsterRequestResetAggro", (data) => {
        //let the server know so it can update the database
        newSocket.emit("monsterRequestResetAggro", data);
      })
    );

    //phaser is letting us know that it's a local player hit a monster
    unsubscribes.push(
      eventEmitter.subscribe("monsterTookDamage", (data) => {
        newSocket.emit("monsterTookDamage", data);
      })
    );

    //phaser is letting us know that it's a monster hit the local player
    unsubscribes.push(
      eventEmitter.subscribe("playerTookDamage", (data) => {
        // dispatch(localPlayerTookDamage(data.damage));
        newSocket.emit("playerTookDamage", data);
      })
    );

    //a controlling monster wants to broadcast data
    unsubscribes.push(
      eventEmitter.subscribe("monsterControlDirections", (data) => {
        newSocket.emit("monsterControlDirections", data);
      })
    );

    unsubscribes.push(
      eventEmitter.subscribe("reviveLocalPlayer", (data) => {
        // console.log('reviveLocalPlayer', data.playerCharacter.reviveHealth);
        dispatch(revivePlayer(data.playerCharacter.reviveHealth));
      })
    );

    unsubscribes.push(
      eventEmitter.subscribe("updateMonsterDBPosition", (data) => {
        newSocket.emit('updateMonsterDBPosition', data);
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe()); //clear all subscriptions
      newSocket.close();
    };
  }, []);

  return <></>;
};
