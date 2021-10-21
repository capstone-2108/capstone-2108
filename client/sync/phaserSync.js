import React, { useEffect, useState } from "react";
import { eventEmitter } from "../../src/event/EventEmitter";
import {
  fetchCharacterData,
  fetchNearbyMonsters,
  fetchNearbyPlayers,
  fetchRemoteCharacterData,
  fetchSeletedMonster,
  heartbeat,
  remotePlayerChangedScenes,
  remotePlayerChangesScenes
} from "../store/player";

import { useDispatch, useSelector } from "react-redux";
import { Game } from "../../src/Game";
import io from "socket.io-client";
import { updatePlayerCharacter } from "../store/player";

//this is a fake component which handles our event subscriptions
//we're using a functional component because we need access to hooks
export const InitSubscriptionsToPhaser = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const playerState = useSelector((state) => state.player);

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

    // newSocket.on("playerChangedScenes", (scene) => {
    //   console.log("CLIENT SIDE PHASERSYNC")
    //   eventEmitter.emit("playerChangedScenes", (scene))
    // })

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

    unsubscribes.push();

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
      eventEmitter.subscribe("phaserUpdate", ({ action, data }) => {
        newSocket.emit(action, data);
      })
    );

    //phaser is making a request to fetch some player data
    unsubscribes.push(
      eventEmitter.subscribe("requestPlayerInfo", (characterId) => {
        dispatch(fetchRemoteCharacterData(characterId));
      })
    );

    //phaser is making a request to fetch some monster data
    unsubscribes.push(
      eventEmitter.subscribe("requestMonsterInfo", (monsterId) => {
        dispatch(fetchSeletedMonster(monsterId));
      })
    );

    //phaser lets us know that a monster aggroed a player
    unsubscribes.push(
      eventEmitter.subscribe("monsterAggroedPlayer", ({ monsterId, playerCharacterId }) => {
        newSocket.emit("monsterAggroedPlayer", { monsterId, playerCharacterId });
      })
    );

    //phaser is letting us know that a monster's aggro has reset
    unsubscribes.push(
      eventEmitter.subscribe("monsterResetAggro", ( monsterId ) => {
        //let the server know so it can update the database
        newSocket.emit("monsterResetAggro", monsterId);
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe()); //clear all subscriptions
      newSocket.close();
    };
  }, []);

  return <></>;
};
