require('dotenv').config();
const {db, User} = require('./db');
// const seed = require('../script/seed');
const PORT = process.env.PORT || 1337;
const cors = require('cors');
const app = require('./app');
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const cookieSignature = require('cookie-signature');
const cookie = require('cookie');


const io = new Server(server, {
  cors: {
    origin: 'http://localhost:1337',
    methods: ['GET', 'POST'],
    credentials: true,
    cookie: {

    }
  }}
);


const init = async () => {
  try {
    // if(process.env.SEED === 'true'){
    //   await seed();
    // }
    // else {
    await db.sync();
    // }
    // start listening (and create a 'server' object representing our server)
    app.listen(PORT, () => console.log(`Super Awesome MMO running on ${PORT}`));

    const worldChat = io.of('/worldChat');
    worldChat.on('connection', async (socket) => {
      const cookies = cookie.parse(socket.request.headers.cookie);
      if(cookies.token) {
        const user = await User.findByToken(cookieSignature.unsign(cookies.token.slice(2), process.env.cookieSecret));
        // console.log(user);
      }
      socket.on('sendMessage', (message) => {
        console.log('sendMessage', message);
        socket.broadcast.emit('newMessage', message);
      });
      console.log('Socket IO connection');
    })



    server.listen(1338, () => {
      console.log('listening on *:1338');

    });
  }
  catch (ex) {
    console.log(ex);
  }
};

init();
