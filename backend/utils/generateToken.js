const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, secret, { expiresIn });

module.exports = generateToken;
