const { Server } = require("socket.io");
const server = require("../app");
const { requireSocketToken } = require("./socket-middleware");
const io = new Server(server);
const { PlayerCharacter, Location } = require("../db");
const { transformToPayload } = require("../db/models/PlayerCharacter");
const chalk = require('chalk');

const worldChat = io.of("/worldChat");
const gameSync = io.of("/gameSync");
const heartBeats = {};

function initSocketServer() {
  initWorldChat();
  initGameSync();
}

function initWorldChat() {
  worldChat.use(requireSocketToken);
  worldChat.on("connection", async (socket) => {
    try {
      socket.on("sendMessage", (message) => {
        socket.broadcast.emit("newMessage", message);
      });

      socket.on("connect_error", (error) => {
        console.log("worldChat namespace connect error!");
        console.log(error);
      });
      if (socket.user) {
        console.log(`${socket.user.firstName} has connected to world chat!`);
      }
    } catch (err) {
      console.log(err);
    }
  });
}

function initGameSync() {
  //todo: should probably setup a channel for each scene
  gameSync.use(requireSocketToken);
  gameSync.on("connection", async (socket) => {
    socket.on("connect_error", (error) => {
      console.log("gameSync namespace connect error!");
      console.log(error);
    });

    //when players move we receive this event, we should emit an event to all clients to let
    //them know that this player has moved
    socket.on("playerPositionChanged", (data) => {
      //let other clients know this this player has moved
      socket.broadcast.emit("remotePlayerPositionChanged", data);
    });

    socket.on("playerChangedScenes", async (data) => {
      try {
        const playerCharacter = await PlayerCharacter.getCharacter(data.characterId);
        await playerCharacter.location.update({
          sceneId: data.sceneId,
          xPos: data.xPos,
          yPos: data.yPos
        });
        await playerCharacter.reload();
        const characterPayload = transformToPayload(playerCharacter);
        //let the world know that this player has moved to a new scene
        socket.broadcast.emit("remotePlayerChangedScenes", characterPayload);
      } catch (err) {
        console.log(err);
      }
    });

    //we'll receive heartbeats from players to let us know they are still logged in
    //heartbeats are sent out when a player logs in, and on request from the server
    socket.on("heartbeat", async ({ userId, characterName, characterId }) => {
      console.log("Received heart beat for " + characterName);
      heartBeats[characterId] = {
        userId,
        characterName,
        lastSeen: Date.now()
      };
    });

    socket.on("monsterAggroedPlayer", async ({ monsterId, playerCharacterId }) => {
      chalk.red(`Monster ${monsterId} aggroed player ${playerCharacterId}`);
    });
  });
}

function initHeartbeat() {
  setInterval(() => {
    try {
      for (const [characterId, heartBeatInfo] of Object.entries(heartBeats)) {
        const {characterName, lastSeen, userId} = heartBeatInfo;
        if (Date.now() - lastSeen > 60000) {
          PlayerCharacter.logout(userId, characterId)
          console.log(`Logging out ${characterName} due to inactivity`);
          worldChat.emit("newMessage", {
            channel: "world",
            message: {
              name: "WORLD",
              message: characterName + " has been logged out by the server!"
            }
          });
          gameSync.emit('remotePlayerLogout', characterId);
          delete heartBeats[characterId];
        }
      }
      console.log("Sending out heart beat check");
      gameSync.emit("heartbeatCheck");
    }
    catch(err) {
      console.log(err);
    }
  }, 20000);
}

module.exports = {
  initSocketServer,
  gameSync,
  worldChat,
  initHeartbeat
};
