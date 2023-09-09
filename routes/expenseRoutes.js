const express = require('express');
const router = express.Router();
const expenseControllers = require('../controllers/expenseControllers');
const authenticateToken = require('../middleware/authenticate');
const purchaseControllers = require('../controllers/purchase');


router.get('/allExpenses',authenticateToken, expenseControllers.allExpenses);
router.post('/signup', expenseControllers.addUser);
router.post('/login', expenseControllers.loginUser);
// router.get('/user/dashboard', expenseControllers.dashboard);
router.post('/user/add-expense', authenticateToken, expenseControllers.addExpense);
router.delete('/delete-expense/:id', expenseControllers.deleteExpense);
router.put('/edit-expense/:id', expenseControllers.updateExpense);
router.get('/edit-expense/:id', expenseControllers.editExpense);
router.get('/purchase/premiumMembership', authenticateToken, purchaseControllers.premiumMembership);
router.post('/purchase/updatetransactionstatus', authenticateToken, purchaseControllers.updatetransactionstatus);


 
module.exports = router;      