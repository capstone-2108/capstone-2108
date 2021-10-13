const cors = require("cors");
const app = require("../app");
app.use(cors());
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cookieSignature = require("cookie-signature");
const cookie = require("cookie");
const { User } = require("../db");
const { requireSocketToken } = require("./socket-middleware");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:1337",
    methods: ["GET", "POST"],
    credentials: true,
    cookie: {}
  }
});
const worldChat = io.of("/worldChat");
const gameSync = io.of("/gameSync");

function initSocketServer() {
  initWorldChat();
  initGameSync();
  server.listen(1338, () => {
    console.log("Chat server listening on *:1338");
  });
}

function initWorldChat() {
  worldChat.use(requireSocketToken);
  worldChat.on("connection", async (socket) => {
    socket.on("sendMessage", (message) => {
      console.log("sendMessage", message);
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
      console.log("data", data);
      socket.broadcast.emit("otherPlayerPositionChanged", data);
    });

    console.log(`${socket.user.firstName} has connected to game sync!`);
  });
}

module.exports = {
  initSocketServer,
  gameSync,
  worldChat
};
