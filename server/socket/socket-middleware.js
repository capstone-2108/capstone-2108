const cookie = require('cookie');
const {User} = require('../db');
const cookieSignature = require('cookie-signature');

const requireSocketToken = async (socket, next) => {
  const cookies = cookie.parse(socket.request.headers.cookie);
  if(cookies.token) {
    socket.user = await User.findByToken(cookieSignature.unsign(cookies.token.slice(2), process.env.cookieSecret));
    next();
  }
  else {
    throw 'No token found!';
  }
}

module.exports = {
  requireSocketToken
}