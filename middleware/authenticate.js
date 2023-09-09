const jwt = require('jsonwebtoken');
const secretKey = 'x7D#pT9m$N&fE!aWjR5gKq2vC*H@LzU8';
const User = require('../models/user');

function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
   // console.log(token);

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

   // console.log(token);log
  // console.log('nikhil');
   
   const user= jwt.verify(token, secretKey);
  
   User.findByPk(user.userId).then(user => {
    req.user =user;

    next();
   })

        
        
}

module.exports = authenticateToken;
