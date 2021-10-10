require('dotenv').config();
const {db, User} = require('./db');
// const seed = require('../script/seed');
const PORT = process.env.PORT || 1337;
const app = require('./app');
const {initChatServer} = require('./socket');


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
    initChatServer();
  }
  catch (ex) {
    console.log(ex);
  }
};

init();
