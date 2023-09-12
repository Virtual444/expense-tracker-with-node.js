const  user = require('../models/user');
const Expense = require('../models/expenses');
const order = require('../models/orders');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secretKey = 'x7D#pT9m$N&fE!aWjR5gKq2vC*H@LzU8';


function generateToken(id, isPremium) {
    return jwt.sign({userId: id, premium: isPremium}, secretKey)
}


exports.addUser = async(req, res, next) => {
    const { name, email, password} = req.body;

    try {
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = await user.findOne({
            where : {email:email}
        });
        

        if(existingUser) {
            return res.status(400).json({message: "User already Exists"});
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        
        const newUser = await user.create({name, email, password: hashedPassword});
        res.status(200).json({newUser});
        
        

  
    } catch (error) {  

        console.log(error);
        res.status(500).json({error: 'Internal Server error'});
    }

};

exports.loginUser = async (req, res, next) => {

    const {email, password} = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const alreadyUser = await user.findOne({
            where: { email: email }
        }); 

        if (!alreadyUser) {
            return res.status(401).json({ message: 'Used Email is not Registered' });
        }
        const isMatch = await bcrypt.compare(password, alreadyUser.password);
        console.log(alreadyUser.id);

        if(isMatch) {
            const success = await order.findOne({ where : {userId:alreadyUser.id, status:'SUCCESSFUL'}});
            console.log('nikk');
            console.log(success);
            
            if(success && success.paymentId !== null && success.status === 'SUCCESSFUL'){
              const isPremium = true;
              const token =  generateToken(alreadyUser.id, isPremium);
         res.status(200).json({message: 'user logged in successfully', token:token});
  
            }

            else {
              const isPremium = false;
              const token =  generateToken(alreadyUser.id, isPremium);
              res.status(200).json({message: 'user logged in successfully', token:token});
            }
  
       }else {

        return res.status(401).json({ message: 'Password is not correct' });

       }
  
      
    } catch (error) {
        
        console.log(error);
        res.status(500).json({error: 'Internal Server error'});
    }

};



exports.addExpense = async(req, res, next) => {
   
    const { name, amount, category } = req.body;
    console.log(req.body);

    try {
        if (!name || !amount || !category) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        console.log(req.user);
        const userId = req.user.id;
      
       
        const newExpense = await Expense.create({ name, amount, category, userId });
        const expenseUser = await user.findByPk(userId);
        if (expenseUser) {
            expenseUser.totalExpenses += amount; 
            await expenseUser.save(); 
          }
        
        console.log(newExpense);
        res.status(201).json({newExpense});   
    
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }


};

exports.allExpenses = async (req, res, next) => {
   
  
    try {
       
        const id = req.user.id;
        const expenses = await Expense.findAll({
            where: { userId: id }
        });
        const expenseUser = await user.findOne({where:{id:id}});
        const totalExpense = expenseUser.totalExpenses;

        // console.log(expenses);
        res.status(200).json({ expenses, totalExpense });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Errorr' });
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        const id = req.params.id;
        const targetExpense = await Expense.findOne({where: {id:id}});
        console.log(targetExpense);
        if(!targetExpense) {
            return res.status(404).json({error:'Expense not found'})
        }
        const deleteUser = await user.findOne({ where: { id: targetExpense.userId } });
        deleteUser.totalExpenses -= targetExpense.amount;
        await deleteUser.save();

        await targetExpense.destroy();
        res.status(200).json({message: 'Deleted succesfullly'})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server error'})
    }

};

exports.editExpense = async (req, res, next) => {
    try {
      const id = req.params.id;
      const expense = await Expense.findByPk(id);
  
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      
      res.status(200).json({ expense });
    } catch (error) {

      console.log(error);
      
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.updateExpense = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { name, amount, category } = req.body;
  
      const expense = await Expense.findByPk(id);
  
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      const editUser = await user.findOne({ where: { id: expense.userId } });
        editUser.totalExpenses -= expense.amount;
        
        expense.name = name;
        expense.amount = amount;
        expense.category = category;
        
        await expense.save();
        editUser.totalExpenses += expense.amount;

        await editUser.save();
      
  
  
      res.status(200).json({ message: 'Expense updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.showLeaderboard = async (req, res, next) => {
    try {
        
        const leaderboardData = await user.findAll({
          attributes: ['name', 'totalExpenses'],
          order: [['totalExpenses', 'DESC']],
        });
        res.json(leaderboardData);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
};


