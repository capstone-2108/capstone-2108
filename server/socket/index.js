const cors = require('cors');
const app = require('../app');
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const cookieSignature = require('cookie-signature');
const cookie = require('cookie');
const {User} = require('../db');
const {requireSocketToken} = require('./socket-middleware');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:1337',
    methods: ['GET', 'POST'],
    credentials: true,
    cookie: {}
  }}
);
const worldChat = io.of('/worldChat');
const gameSync = io.of('/gameSync');

function initSocketServer() {
  initWorldChat();
  initGameSync();
  server.listen(1338, () => {
    console.log('Chat server listening on *:1338');

  });
}

function initWorldChat() {
  worldChat.use(requireSocketToken);
  worldChat.on('connection', async (socket) => {
    socket.on('sendMessage', (message) => {
      console.log('sendMessage', message);
      socket.broadcast.emit('newMessage', message);
    });

    socket.on("connect_error", (error) => {
      console.log('Chat server error!');
      console.log(error);
    });
    console.log(`${socket.user.firstName} has connected to world chat!`);
  })
}

function initGameSync() {
  gameSync.use(requireSocketToken);
  gameSync.on('connection', async (socket) => {
    // socket.on('sendMessage', (message) => {
    //   console.log('sendMessage', message);
    //   socket.broadcast.emit('newMessage', message);
    // });

    socket.on("connect_error", (error) => {
      console.log('Chat server error!');
      console.log(error);
    });
    console.log(`${socket.user.firstName} has connected to game sync!`);
  })
}

module.exports = {
  initSocketServer,
  gameSync,
  worldChat
}