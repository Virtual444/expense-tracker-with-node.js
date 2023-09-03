const  user = require('../models/user');
const Expense = require('../models/expenses');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const secretKey = 'x7D#pT9m$N&fE!aWjR5gKq2vC*H@LzU8';
const jwt = require('jsonwebtoken');


function generateToken(id) {
    return jwt.sign({userId: id}, secretKey)
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

          if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
    }

       const token =  generateToken(alreadyUser.id);
       res.status(200).json({message: 'user logged in successfully', token:token});
        
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


        const token = req.header('Authorization');
        console.log(token);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user =  jwt.verify(token, secretKey);
        
        const userId = user.userId;
        const newExpense = await Expense.create({ name, amount, category, userId});
        console.log(newExpense);
        res.status(201).json({newExpense});
    
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }


};

exports.allExpenses = async (req, res, next) => {
    //console.log('nikhil');
  
    try {
        const token = req.header('Authorization');
        console.log(token);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user =  jwt.verify(token, secretKey);
        
        const id = user.userId;
         console.log(id);
        const expenses = await Expense.findAll({
            where: { userId: id }
        });
        console.log(expenses);
        res.status(200).json({ expenses });
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

        await targetExpense.destroy();
        res.status(200).json({message: 'Deleted succesfullly'})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server error'})
    }

}

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
  
      expense.name = name;
      expense.amount = amount;
      expense.category = category;
  
      await expense.save();
  
      res.status(200).json({ message: 'Expense updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



