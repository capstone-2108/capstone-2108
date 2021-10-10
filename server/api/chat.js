const {requireTokenMiddleware} = require('../auth-middleware');
const router = require("express").Router();
const cookieParser = require("cookie-parser");
router.use(cookieParser(process.env.cookieSecret));
const {worldChat} = require('../socket');

//POST /api/chat/world - posts a new message to be emitted to the world
router.post('/world', requireTokenMiddleware, async (req, res, next) => {

  res.sendStatus(200);
  worldChat.emit('newMessage', {
      channel: 'world',
      message: {
        name: req.user.firstName, //todo: change this to the person's character name
        message: req.body.message
      }
    }
  );
  // res.send({
  //   channel: 'world',
  //   message: {
  //     name: req.user.firstName, //todo: change this to the person's character name
  //     message: req.body.message
  //   }
  // });
});

module.exports = router;