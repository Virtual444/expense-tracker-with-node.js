const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers');


router.post('/signup', expenseControllers.addUser);
router.post('/login', expenseControllers.loginUser);
router.get('/user/dashboard', expenseControllers.dashboard);
 
module.exports = router; 