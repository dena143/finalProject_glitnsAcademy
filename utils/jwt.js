const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(payload) {
  return jwt.sign(payload, process.env.SECRET_KEY_JWT || "test");
}

function decodeToken(token) {
  return jwt.verify(token, process.env.SECRET_KEY_JWT || "test");
}

module.exports = {
  generateToken,
  decodeToken,
};
