const  user = require('../models/user');

exports.addUser = async(req, res, next) => {
    try {
        
        const { name, email, password} = req.body;
        const newUser = await user.create({name, email, password});
        res.status(200).json({newUser});
  
    } catch (error) {
        
        console.log(error);
        res.status(500).json({error: 'Internal Server error'});
    }

};