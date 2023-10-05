require("dotenv").config();
const user = require("../models/user");
const order = require("../models/orders");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");
const secretKey = process.env.secretKey;

exports.addUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const t = await sequelize.transaction();
    const existingUser = await user.findOne({
      where: { email: email },
      transaction: t,
    });

    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: "User already Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await user.create(
      { name, email, password: hashedPassword },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json({ newUser });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({ error: "Internal Server error" });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const t = await sequelize.transaction();

    const alreadyUser = await user.findOne({
      where: { email: email },
      transaction: t,
    });

    if (!alreadyUser) {
      await t.rollback();
      return res.status(401).json({ message: "Used Email is not Registered" });
    }
    const isMatch = await bcrypt.compare(password, alreadyUser.password);

    if (isMatch) {
      const success = await order.findOne({
        where: { userId: alreadyUser.id, status: "SUCCESSFUL" },
        transaction: t,
      });

      if (
        success &&
        success.paymentId !== null &&
        success.status === "SUCCESSFUL"
      ) {
        const isPremium = true;
        const token = generateToken(alreadyUser.id, isPremium);
        res
          .status(200)
          .json({ message: "user logged in successfully", token: token });
      } else {
        const isPremium = false;
        const token = generateToken(alreadyUser.id, isPremium);
        res
          .status(200)
          .json({ message: "user logged in successfully", token: token });
      }
    } else {
      await t.rollback();
      return res.status(401).json({ message: "Password is not correct" });
    }

    await t.commit();
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({ error: "Internal Server error" });
  }
};

function generateToken(id, isPremium) {
  return jwt.sign({ userId: id, premium: isPremium }, secretKey);
}
