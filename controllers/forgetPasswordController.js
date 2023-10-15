require("dotenv").config();
const brevo = require("@getbrevo/brevo");
const forgetPasswordRequest = require("../models/forgotPasswordRequest");
const user = require("../models/user");
const sequelize = require("../util/database");

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
 
  try {
    const t = await sequelize.transaction();

    if (!email) {
      await t.rollback();
      return res.status(400).json({ message: "Email is required." });
    }

    const existingUser = await user.findOne({
      where: { email }, 
      transaction: t,
    });

    if (!existingUser) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "User with this email does not exist." });
    }
    const resetRequest = await forgetPasswordRequest.create(
      { userId: existingUser.id },
      { transaction: t }
    );

    const client = brevo.ApiClient.instance;

    const apikey = client.authentications["api-key"];
    apikey.apiKey =process.env.sendBlueInApi
    

    const transEmailApi = new brevo.TransactionalEmailsApi();
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Password Reset Link for Expense Tracker";
    sendSmtpEmail.htmlContent = `<html><body><h3>Click below to reset your password</h3><a href="/password/reset-password/${resetRequest.id}"> CLICK HERE </a></body></html>`;
    sendSmtpEmail.sender = {
      name: "Expense Tracker",
      email: "asitpal211@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];

    transEmailApi
      .sendTransacEmail(sendSmtpEmail)
      .then((sendinBlueResponse) => {
        if (sendinBlueResponse.messageId) {
          res
            .status(200)
            .json({ message: "Password reset email sent successfully" });
        } else {
          res
            .status(500)
            .json({ error: "Failed to send password reset email" });
        }
      })
      .catch((error) => {
        console.error(error);     
        res.status(500).json({ error: "Internal Server error" });
      });

    await t.commit();
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).json({ error: "Internal Server error" });
  }
};
