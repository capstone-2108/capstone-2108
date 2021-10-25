const Sequelize = require("sequelize");
const {db} = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");

const SALT_ROUNDS = 5;

const User = db.define("user", {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  fullName: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.firstName + " " + this.lastName;
    }
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  loggedIn: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
});

/***********************
 * Instance Methods    *
 ***********************/
User.prototype.correctPassword = function (candidatePwd) {
  //we need to compare the plain version to an encrypted version of the password
  return bcrypt.compare(candidatePwd, this.password);
};

User.prototype.generateToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT);
};

/***********************
 * Model Methods       *
 ***********************/

/**
 *
 * @param username
 * @param password
 * @returns {Promise<{user: *, token: *}>}
 */
User.authenticate = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.correctPassword(password))) {
    const error = Error("Bad credentials");
    error.status = 401;
    throw error;
  }
  const token = await user.generateToken();
  return { user, token };
};

/**
 *
 * @param token
 * @returns {Promise<Model|null>}
 * @throws Error
 */
User.findByToken = async (token) => {
  try {
    const verifiedToken = await jwt.verify(token, process.env.JWT);
    const user = User.findByPk(verifiedToken.id);
    if (!user) {
      throw new UserNotFoundError("Unable to find user");
    }
    return user;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      console.log(err);
    } else if (err instanceof TokenExpiredError) {
      console.log(err);
    } else {
      console.log(err);
      err.status = 401;
    }
    throw err;
  }
};

User.logout = async function (userId) {
  return this.update({loggedIn: false}, {
    where: {
      id: userId
    }
  });
};

User.clearAllLogins = function() {
  db.query('UPDATE users SET "loggedIn" = false');
}


/******************
 * Custom Error   *
 * ****************/
class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserNotFoundError";
  }
}


/******************
 * Hooks          *
 * ****************/
const hashPassword = async (user) => {
  //in case the password has been changed, we want to encrypt it with bcrypt
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
};

const lowerCaseEmail = (user) => {
  if (user.changed("email")) {
    user.email = user.email.toLowerCase();
  }
};

User.beforeCreate(hashPassword);
User.beforeUpdate(hashPassword);
User.beforeBulkCreate((users) => Promise.all(users.map(hashPassword)));

User.beforeSave(lowerCaseEmail);
User.beforeBulkCreate((users) => Promise.all(users.map(lowerCaseEmail)));

module.exports = { User };
