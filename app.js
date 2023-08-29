const express = require('express');
const path  = require('path');
const bodyParser = require('body-parser');
const  cors = require('cors');
const sequelize = require('./util/database');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', expenseRoutes);

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log(`Server is running on port ${3000}`);
    });
  })
  .catch(error => {
    console.error('Database sync error:', error);
  });
