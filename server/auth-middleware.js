const { User } = require("./db");

//middleware to get the user by the data in their token
const requireTokenMiddleware = async (req, res, next) => {
  try {
    console.log('signedCookies', req.signedCookies);
    if (req.signedCookies && req.signedCookies.token) {
      console.log('signed cookie', req.signedCookies.token);
      req.user = await User.findByToken(req.signedCookies.token);
      next();
    } else {
      throw { status: 401, message: "Missing Token!" };
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//check if the user is an admin, proceed if true, throw error otherwise
const isAdminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    throw { message: "Not permitted", status: 403 };
  }
};

module.exports = {
  requireTokenMiddleware,
  isAdminMiddleware
};
