require('dotenv').config(); 
const express = require("express");
const fs = require('fs');
const path = require("path");
const cors = require("cors");
const sequelize = require("./util/database");
const expenseRoutes = require("./routes/expenseRoutes");
const User = require("./models/user");
const Expense = require("./models/expenses");
const Order = require("./models/orders");
const forgotPasswordRequest = require("./models/forgotPasswordRequest");
const app = express();

const accessLogStream=fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
sequelize.options.logging = (message) => {
  accessLogStream.write(`[${new Date().toISOString()}] Sequelize: ${message}\n`);
};

app.use(cors());
app.use(express.json());  
app.use(express.static("public"));

app.get("/login", (req, res) => { 
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/views/signup.html");
});

app.get("/password/forgot-password", (req, res) => {
  res.sendFile(__dirname + "/views/forgotPassword.html");
});

app.get("/user/dashboard", (req, res) => {
  res.sendFile(__dirname + "/views/dashboard.html");
});

app.get("/password/reset-password/:requestId", (req, res) => {
  res.sendFile(__dirname + "/views/passwordResetForm.html");
});
app.get("/show-download-history", (req, res) => {
  res.sendFile(__dirname + "/views/downloadHistory.html");
});

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(forgotPasswordRequest);
forgotPasswordRequest.belongsTo(User);

// app.use(express.static(path.j  oin(__dirname, 'views')))
// app.use(express.static(path.join(__dirname, 'public')))
app.use("/", expenseRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${3000}`);
    });
  })
  .catch((error) => {
    console.error("Database sync error:", error);
  });
