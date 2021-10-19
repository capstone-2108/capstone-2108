import React, { useEffect, useState } from "react";
import { eventEmitter } from "../../src/event/EventEmitter";
import { fetchCharacterData, fetchNearbyPlayers, fetchRemoteCharacterData } from "../store/player";
import { useDispatch } from "react-redux";
import { Game } from "../../src/Game";
import io from "socket.io-client";
import { updatePlayerCharacter } from "../store/player";

//this is a fake component which handles our event subscriptions
//we're using a functional component because we need access to hooks
export const InitSubscriptionsToPhaser = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    //loads the game
    window.game = new Game();

    /****************
     * Socket.io *
     ***************/
    //sets up a socket for 2 way persistent communication via socket.io
    const newSocket = io(`http://${window.location.hostname}:1337/gameSync`, {
      withCredentials: true
    });
    setSocket(newSocket); //save the socket into the component state

    // listens for other players loading in
    // todo: put this back in
    // newSocket.on("otherPlayerLoad", (data) => {
    //   eventEmitter.emit("otherPlayerLoad", data);
    // });

    // newSocket.on("playerChangedScenes", (scene) => {
    //   console.log("CLIENT SIDE PHASERSYNC")
    //   eventEmitter.emit("playerChangedScenes", (scene))
    // })

    //this is where the server lets us know that others players have moved, once we receive this signal we
    //tell phaser to move those characters on the screen
    newSocket.on("otherPlayerPositionChanged", (position) => {
      //this is how we tell phaser that another player has moved
      eventEmitter.emit("otherPlayerPositionChanged", position);
    });

    /****************
     * Event Emitter *
     ***************/
    //Subscribes to an event which lets us know when phaser has fully loaded
    eventEmitter.subscribe("phaserLoad", async (data) => {
      const player = await dispatch(fetchCharacterData()); //load the players data into redux
      eventEmitter.emit("playerLoad", player);
    });

    eventEmitter.subscribe("sceneLoad", async (data) => {
      console.log('sceneLoad');
      const player = await dispatch(fetchCharacterData()); //load the players data into redux
      eventEmitter.emit("scenePlayerLoad", player);
      //load any players which are in the same scene as the player
      const nearbyPlayers = await dispatch(fetchNearbyPlayers(player.characterId));
      eventEmitter.emit("nearbyPlayerLoad", nearbyPlayers);
    });

    eventEmitter.subscribe("playerChangedScenes", async (data) => {
      //update store state with new sceneName and sceneId for this player
      console.log('IN PLAYER CHANGED SCENES')
      dispatch(updatePlayerCharacter({sceneName: data.sceneName, sceneId: data.sceneId}))
      newSocket.emit("playerChangedScenes", data)
    })

    //phaser will send us updates via the "phaserUpdate" event
    eventEmitter.subscribe("phaserUpdate", ({ action, data }) => {
      //send a message using socket.io to let the server know that the player changed position
      newSocket.emit(action, data);
    });

    eventEmitter.subscribe("requestPlayerInfo", (characterId) => {
      dispatch(fetchRemoteCharacterData(characterId));
    });

    return () => newSocket.close();
  }, []);

  return <></>;
};
