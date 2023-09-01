const express = require('express');
const path  = require('path');
const bodyParser = require('body-parser');
const  cors = require('cors');
const sequelize = require('./util/database');
const expenseRoutes = require('./routes/expenseRoutes');
const app = express();


app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});


app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});    

app.get('/user/dashboard', (req, res) => {
  res.sendFile(__dirname + '/views/dashboard.html');
}); 


                 
                                   
// app.use(express.static(path.j  oin(__dirname, 'views')))
// app.use(express.static(path.join(__dirname, 'public')))
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
