require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;
const User = require("../models/user");

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = jwt.verify(token, secretKey);

  User.findByPk(user.userId).then((user) => {
    req.user = user;

    next();
  });
}

module.exports = authenticateToken;
