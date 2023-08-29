const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers');


router.post('/user/signup', expenseControllers.addUser);


module.exports = router;