const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers');

router.get('/allExpenses',   expenseControllers.allExpenses);
router.post('/signup', expenseControllers.addUser);
router.post('/login', expenseControllers.loginUser);
// router.get('/user/dashboard', expenseControllers.dashboard);
router.post('/user/add-expense', expenseControllers.addExpense);
router.delete('/delete-expense/:id', expenseControllers.deleteExpense)
router.put('/edit-expense/:id', expenseControllers.updateExpense)
router.get('/edit-expense/:id', expenseControllers.editExpense)

   
module.exports = router;      