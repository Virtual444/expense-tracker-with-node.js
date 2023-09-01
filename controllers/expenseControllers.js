const  user = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

        

        res.status(200).json({alreadyUser});
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({error: 'Internal Server error'});
    }

};


exports.dashboard = async(req, res, next) => {

};