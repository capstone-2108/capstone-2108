const { Server } = require("socket.io");
const server = require("../app");
const { requireSocketToken } = require("./socket-middleware");
const io = new Server(server);
const {PlayerCharacter, Location } = require("../db")

const worldChat = io.of("/worldChat");
const gameSync = io.of("/gameSync");

function initSocketServer() {
  initWorldChat();
  initGameSync();
}

function initWorldChat() {
  worldChat.use(requireSocketToken);
  worldChat.on("connection", async (socket) => {
    socket.on("sendMessage", (message) => {
      socket.broadcast.emit("newMessage", message);
    });

    socket.on("connect_error", (error) => {
      console.log("worldChat namespace connect error!");
      console.log(error);
    });
    console.log(`${socket.user.firstName} has connected to world chat!`);
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
      socket.broadcast.emit("otherPlayerPositionChanged", data);
    });

    socket.on("playerChangedScenes", async (data) => {
      //update the database with the new location
      console.log('index data', data)
      try {
        const playerChar = await PlayerCharacter.findOne({
          where: { id: data.characterId },
          include: Location
        })
        const locationInfo = await Location.findOne({
          where: { id: playerChar.locationId }
        })
        const updated = await locationInfo.update({sceneId: data.sceneId})
      } catch(err) {
        console.log(err)
      }
      //don't know what this is doing
      socket.broadcast.emit("playerChangedScenes")
    });

    console.log(`${socket.user.firstName} has connected to game sync!`);
  });
}

module.exports = {
  initSocketServer,
  gameSync,
  worldChat
};
