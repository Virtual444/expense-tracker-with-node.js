const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers')
const expenseControllers = require('../controllers/expenseControllers');
const authenticateToken = require('../middleware/authenticate');
const purchaseControllers = require('../controllers/purchase');
const forgotPasswordController = require('../controllers/forgetPasswordController');
const resetpasswordControllers = require('../controllers/resetPasswordController');



router.get('/allExpenses',authenticateToken, expenseControllers.allExpenses);
router.post('/signup', userControllers.addUser);
router.post('/login', userControllers.loginUser); 
router.post('/password/forgot-password', forgotPasswordController.forgotPassword);
router.post('/password/reset-password/:requestId',resetpasswordControllers.resetPasswordForm);

router.post('/user/add-expense', authenticateToken, expenseControllers.addExpense);
router.delete('/delete-expense/:id', expenseControllers.deleteExpense);
router.put('/edit-expense/:id', expenseControllers.updateExpense);
router.get('/edit-expense/:id', expenseControllers.editExpense);
router.get('/purchase/premiumMembership', authenticateToken, purchaseControllers.premiumMembership);
router.post('/purchase/updatetransactionstatus', authenticateToken, purchaseControllers.updatetransactionstatus);
router.get('/show-leaderboard', expenseControllers.showLeaderboard);
 


 
module.exports = router;      